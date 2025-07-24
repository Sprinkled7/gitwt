import chalk from 'chalk';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import inquirer from 'inquirer';
import { join, resolve } from 'path';
export class WorktreeManager {
    async runGitCommand(command, cwd) {
        return new Promise((resolve, reject) => {
            const gitProcess = spawn('git', command.split(' '), {
                cwd,
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            let stdout = '';
            let stderr = '';
            gitProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            gitProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            gitProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout.trim());
                }
                else {
                    reject(new Error(`Git command failed: ${stderr}`));
                }
            });
        });
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
            // Create and checkout the branch
            await this.runGitCommand(`checkout -b ${branch}`);
            // Create the worktree
            await this.runGitCommand(`worktree add ${worktreePath} ${branch}`);
            console.log(chalk.blue(`Created worktree: ${worktreeName}`));
            console.log(chalk.blue(`Path: ${worktreePath}`));
            console.log(chalk.blue(`Branch: ${branch}`));
        }
        catch (error) {
            // Cleanup if creation fails
            if (existsSync(worktreePath)) {
                await this.runGitCommand(`worktree remove ${worktreePath} --force`);
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
        // Switch to target branch
        await this.runGitCommand(`checkout ${targetBranch}`);
        await this.runGitCommand('pull');
        for (const worktreePath of paths) {
            if (!existsSync(worktreePath)) {
                throw new Error(`Worktree path does not exist: ${worktreePath}`);
            }
            try {
                // Get the branch name for this worktree
                const branch = await this.runGitCommand('branch --show-current', worktreePath);
                // Merge the branch
                await this.runGitCommand(`merge ${branch} -m "${message}"`);
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