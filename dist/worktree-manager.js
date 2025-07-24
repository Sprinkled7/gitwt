import chalk from 'chalk';
import { execa } from 'execa';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import inquirer from 'inquirer';
import { join, resolve } from 'path';
export class WorktreeManager {
    async runGitCommand(command, cwd) {
        try {
            // Split command properly, handling quoted strings
            const args = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')/g) || [];
            const { stdout } = await execa('git', args, {
                cwd,
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            return stdout.trim();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Git command failed: ${error.message}`);
            }
            throw new Error(`Git command failed: ${error}`);
        }
    }
    async ensureGitRepo() {
        try {
            await this.runGitCommand('rev-parse --git-dir');
        }
        catch (error) {
            throw new Error('Not a Git repository. Please run this command from a Git repository.');
        }
    }
    async getProjectName() {
        try {
            const remoteUrl = await this.runGitCommand('config --get remote.origin.url');
            const match = remoteUrl.match(/([^/]+)\.git$/);
            return match ? match[1] : 'project';
        }
        catch {
            return 'project';
        }
    }
    async createWorktree(feature, worktreesPath, branch) {
        await this.ensureGitRepo();
        // Check if we're already in a worktree
        try {
            const worktreeRoot = await this.runGitCommand('rev-parse --git-common-dir');
            const currentDir = await this.runGitCommand('rev-parse --show-toplevel');
            if (worktreeRoot !== currentDir) {
                throw new Error('Cannot create worktree from within another worktree. Please run this command from the main repository.');
            }
        }
        catch (error) {
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
        }
        catch (error) {
            // Cleanup if creation fails
            if (existsSync(worktreePath)) {
                try {
                    await this.runGitCommand(`worktree remove ${worktreePath} --force`);
                }
                catch {
                    // Ignore cleanup errors
                }
            }
            throw error;
        }
    }
    async listWorktrees(worktreesPath) {
        await this.ensureGitRepo();
        const worktrees = [];
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
                    const branch = await this.runGitCommand('branch --show-current', itemPath);
                    const status = await this.getWorktreeStatus(itemPath);
                    worktrees.push({
                        name: item,
                        path: itemPath,
                        branch,
                        status,
                    });
                }
                catch {
                    // Skip if not a valid worktree
                }
            }
        }
        return worktrees;
    }
    async getWorktreeStatus(worktreePath) {
        try {
            const status = await this.runGitCommand('status --porcelain', worktreePath);
            if (status === '') {
                return 'clean';
            }
            else {
                const lines = status.split('\n').filter((line) => line.trim());
                return `${lines.length} changes`;
            }
        }
        catch {
            return 'unknown';
        }
    }
    async mergeWorktrees(paths, targetBranch, message) {
        await this.ensureGitRepo();
        // Get the current branch name
        const currentBranch = await this.runGitCommand('branch --show-current');
        // Switch to target branch (use current branch if target doesn't exist)
        try {
            await this.runGitCommand(`checkout ${targetBranch}`);
        }
        catch {
            // If target branch doesn't exist, stay on current branch
            console.log(chalk.yellow(`Target branch '${targetBranch}' not found, using current branch '${currentBranch}'`));
        }
        for (const worktreePath of paths) {
            if (!existsSync(worktreePath)) {
                throw new Error(`Worktree path does not exist: ${worktreePath}`);
            }
            try {
                // Get the branch name for this worktree
                const branch = await this.runGitCommand('branch --show-current', worktreePath);
                // Merge the branch with no editor
                await this.runGitCommand(`merge ${branch} --no-edit -m "${message}"`);
                console.log(chalk.blue(`Merged ${branch} into ${targetBranch}`));
            }
            catch (error) {
                console.error(chalk.yellow(`Warning: Failed to merge worktree at ${worktreePath}: ${error}`));
            }
        }
    }
    async removeWorktree(feature, worktreesPath, force = false) {
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
                const branch = await this.runGitCommand('branch --show-current', worktreePath);
                await this.runGitCommand(`branch -D ${branch}`);
            }
            catch {
                // Branch might already be deleted or not exist
            }
        }
        catch (error) {
            throw new Error(`Failed to remove worktree: ${error}`);
        }
    }
    async cleanWorktrees(worktreesPath, force = false) {
        await this.ensureGitRepo();
        const worktrees = await this.listWorktrees(worktreesPath);
        let removedCount = 0;
        for (const worktree of worktrees) {
            try {
                const status = await this.getWorktreeStatus(worktree.path);
                if (status === 'clean') {
                    if (!force) {
                        const { confirm } = await inquirer.prompt([
                            {
                                type: 'confirm',
                                name: 'confirm',
                                message: `Remove clean worktree "${worktree.name}"?`,
                                default: true,
                            },
                        ]);
                        if (!confirm) {
                            continue;
                        }
                    }
                    await this.removeWorktree(worktree.name.replace(/^[^-]+-/, ''), worktreesPath, true);
                    removedCount++;
                }
            }
            catch (error) {
                console.error(chalk.yellow(`Warning: Failed to clean worktree ${worktree.name}: ${error}`));
            }
        }
        return removedCount;
    }
}
//# sourceMappingURL=worktree-manager.js.map