import chalk from 'chalk';
import { execa } from 'execa';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import inquirer from 'inquirer';
import { join, resolve } from 'path';
import { EnvCopier } from './env-copier.js';
import { PackageInstaller } from './package-installer.js';
import { WorktreeOptions } from './types.js';

export interface WorktreeInfo {
  name: string;
  path: string;
  branch: string;
  status: string;
}

export class WorktreeManager {
  private async runGitCommand(command: string, cwd?: string): Promise<string> {
    try {
      // Split command properly, handling quoted strings
      const args = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')/g) || [];
      const { stdout } = await execa('git', args, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return stdout.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Git command failed: ${error.message}`);
      }
      throw new Error(`Git command failed: ${error}`);
    }
  }

  private async ensureGitRepo(): Promise<void> {
    try {
      await this.runGitCommand('rev-parse --git-dir');
    } catch (error) {
      throw new Error(
        'Not a Git repository. Please run this command from a Git repository.'
      );
    }
  }

  private async getProjectName(): Promise<string> {
    try {
      const remoteUrl = await this.runGitCommand(
        'config --get remote.origin.url'
      );
      const match = remoteUrl.match(/([^/]+)\.git$/);
      return match ? match[1] : 'project';
    } catch {
      return 'project';
    }
  }

  async createWorktree(
    feature: string,
    worktreesPath: string,
    branch: string,
    options: WorktreeOptions = {}
  ): Promise<void> {
    await this.ensureGitRepo();

    // Check if we're already in a worktree
    try {
      const worktreeRoot = await this.runGitCommand(
        'rev-parse --git-common-dir'
      );
      const currentDir = await this.runGitCommand('rev-parse --show-toplevel');
      if (worktreeRoot !== currentDir) {
        throw new Error(
          'Cannot create worktree from within another worktree. Please run this command from the main repository.'
        );
      }
    } catch (error) {
      // This is expected if we're in the main repository
    }

    const projectName = await this.getProjectName();
    const worktreeName = `${projectName}-${feature}`;
    const worktreePath = resolve(worktreesPath, worktreeName);

    // Create worktrees directory if it doesn't exist
    if (!existsSync(worktreesPath)) {
      mkdirSync(worktreesPath, { recursive: true });
    }

    // Check if worktree already exists
    if (existsSync(worktreePath)) {
      throw new Error(`Worktree already exists at ${worktreePath}`);
    }

    try {
      // Create the worktree with a new branch
      await this.runGitCommand(`worktree add -b ${branch} ${worktreePath}`);

      console.log(chalk.blue(`Created worktree: ${worktreeName}`));
      console.log(chalk.blue(`Path: ${worktreePath}`));
      console.log(chalk.blue(`Branch: ${branch}`));

      // Post-creation tasks
      await this.performPostCreationTasks(worktreePath, options);
    } catch (error) {
      // Cleanup if creation fails
      if (existsSync(worktreePath)) {
        try {
          await this.runGitCommand(`worktree remove ${worktreePath} --force`);
        } catch {
          // Ignore cleanup errors
        }
      }
      throw error;
    }
  }

  private async performPostCreationTasks(
    worktreePath: string,
    options: WorktreeOptions
  ): Promise<void> {
    const envCopier = new EnvCopier();
    const packageInstaller = new PackageInstaller();

    try {
      // Copy environment files if enabled
      if (options.copyEnvFiles !== false) {
        const currentDir = await this.runGitCommand(
          'rev-parse --show-toplevel'
        );
        await envCopier.copyEnvFiles(currentDir, worktreePath);
      }

      // Install packages if enabled
      if (options.installPackages !== false) {
        await packageInstaller.installPackages(worktreePath);
      }
    } catch (error) {
      console.error(
        chalk.yellow(`Warning: Some post-creation tasks failed: ${error}`)
      );
    }
  }

  async listWorktrees(worktreesPath: string): Promise<WorktreeInfo[]> {
    await this.ensureGitRepo();

    const worktrees: WorktreeInfo[] = [];

    if (!existsSync(worktreesPath)) {
      return worktrees;
    }

    const items = readdirSync(worktreesPath);

    for (const item of items) {
      const itemPath = join(worktreesPath, item);
      const stat = statSync(itemPath);

      if (stat.isDirectory()) {
        try {
          // Check if it's a valid worktree
          const branch = await this.runGitCommand(
            'branch --show-current',
            itemPath
          );
          const status = await this.getWorktreeStatus(itemPath);

          worktrees.push({
            name: item,
            path: itemPath,
            branch,
            status,
          });
        } catch {
          // Skip if not a valid worktree
        }
      }
    }

    return worktrees;
  }

  private async getWorktreeStatus(worktreePath: string): Promise<string> {
    try {
      const status = await this.runGitCommand(
        'status --porcelain',
        worktreePath
      );
      if (status === '') {
        return 'clean';
      } else {
        const lines = status.split('\n').filter((line) => line.trim());
        return `${lines.length} changes`;
      }
    } catch {
      return 'unknown';
    }
  }

  async mergeWorktrees(
    paths: string[],
    targetBranch: string,
    message: string
  ): Promise<void> {
    await this.ensureGitRepo();

    // Get the current branch name
    const currentBranch = await this.runGitCommand('branch --show-current');

    // Switch to target branch (use current branch if target doesn't exist)
    try {
      await this.runGitCommand(`checkout ${targetBranch}`);
    } catch {
      // If target branch doesn't exist, stay on current branch
      console.log(
        chalk.yellow(
          `Target branch '${targetBranch}' not found, using current branch '${currentBranch}'`
        )
      );
    }

    for (const worktreePath of paths) {
      if (!existsSync(worktreePath)) {
        throw new Error(`Worktree path does not exist: ${worktreePath}`);
      }

      try {
        // Get the branch name for this worktree
        const branch = await this.runGitCommand(
          'branch --show-current',
          worktreePath
        );

        // Merge the branch with no editor
        await this.runGitCommand(`merge ${branch} --no-edit -m "${message}"`);

        console.log(chalk.blue(`Merged ${branch} into ${targetBranch}`));
      } catch (error) {
        console.error(
          chalk.yellow(
            `Warning: Failed to merge worktree at ${worktreePath}: ${error}`
          )
        );
      }
    }
  }

  async removeWorktree(
    feature: string,
    worktreesPath: string,
    force: boolean = false
  ): Promise<void> {
    await this.ensureGitRepo();

    const projectName = await this.getProjectName();
    const worktreeName = `${projectName}-${feature}`;
    const worktreePath = resolve(worktreesPath, worktreeName);

    if (!existsSync(worktreePath)) {
      throw new Error(`Worktree not found: ${worktreePath}`);
    }

    if (!force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to remove the worktree "${worktreeName}"?`,
          default: false,
        },
      ]);

      if (!confirm) {
        console.log(chalk.yellow('Operation cancelled.'));
        return;
      }
    }

    try {
      // Remove the worktree
      await this.runGitCommand(`worktree remove ${worktreePath} --force`);

      // Try to delete the branch if it exists
      try {
        const branch = await this.runGitCommand(
          'branch --show-current',
          worktreePath
        );
        await this.runGitCommand(`branch -D ${branch}`);
      } catch {
        // Branch might already be deleted or not exist
      }
    } catch (error) {
      throw new Error(`Failed to remove worktree: ${error}`);
    }
  }

  async cleanWorktrees(
    worktreesPath: string,
    force: boolean = false
  ): Promise<number> {
    await this.ensureGitRepo();

    const worktrees = await this.listWorktrees(worktreesPath);
    let removedCount = 0;

    for (const worktree of worktrees) {
      try {
        const status = await this.getWorktreeStatus(worktree.path);

        if (status === 'clean') {
          // Check if the branch has been merged into the main branch
          const isMerged = await this.isBranchMerged(worktree.branch);

          if (isMerged) {
            if (!force) {
              const { confirm } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'confirm',
                  message: `Remove merged worktree "${worktree.name}" (branch: ${worktree.branch})?`,
                  default: true,
                },
              ]);

              if (!confirm) {
                continue;
              }
            }

            // Remove the worktree
            await this.runGitCommand(
              `worktree remove ${worktree.path} --force`
            );

            // Delete the merged branch
            try {
              await this.runGitCommand(`branch -d ${worktree.branch}`);
              console.log(
                chalk.blue(`Deleted merged branch: ${worktree.branch}`)
              );
            } catch (error) {
              console.log(
                chalk.yellow(
                  `Warning: Could not delete branch ${worktree.branch}: ${error}`
                )
              );
            }

            removedCount++;
          } else {
            console.log(
              chalk.yellow(
                `Skipping worktree "${worktree.name}" - branch ${worktree.branch} has not been merged`
              )
            );
          }
        } else {
          console.log(
            chalk.yellow(
              `Skipping worktree "${worktree.name}" - has uncommitted changes`
            )
          );
        }
      } catch (error) {
        console.error(
          chalk.yellow(
            `Warning: Failed to clean worktree ${worktree.name}: ${error}`
          )
        );
      }
    }

    return removedCount;
  }

  private async isBranchMerged(branch: string): Promise<boolean> {
    try {
      // Get the current branch (main/master)
      const currentBranch = await this.runGitCommand('branch --show-current');

      // Check if the branch has been merged into the current branch
      const mergeBase = await this.runGitCommand(
        `merge-base ${currentBranch} ${branch}`
      );
      const branchCommit = await this.runGitCommand(`rev-parse ${branch}`);

      // If merge-base equals branch commit, the branch is fully merged
      return mergeBase === branchCommit;
    } catch (error) {
      // If there's an error, assume the branch is not merged
      return false;
    }
  }
}
