#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import path from 'path';
import { WorktreeManager } from './worktree-manager.js';
const program = new Command();
// Default worktrees path: parent folder of current project
const defaultWorktreesPath = path.join(process.cwd(), '..', 'worktrees');
program
    .name('go-parallel')
    .description('CLI tool for managing Git worktrees')
    .version('1.1.0');
const worktreeManager = new WorktreeManager();
// Create worktree command
program
    .command('create')
    .description('Create a new Git worktree for a feature')
    .argument('<feature>', 'Feature name for the worktree')
    .option('-p, --path <path>', `Path to store worktrees (default: ${defaultWorktreesPath})`, defaultWorktreesPath)
    .option('-b, --branch <branch>', 'Branch name (default: feature/<feature>)')
    .action(async (feature, options) => {
    try {
        const branch = options.branch || `feature/${feature}`;
        await worktreeManager.createWorktree(feature, options.path, branch);
        console.log(chalk.green(`✓ Worktree created successfully for feature: ${feature}`));
    }
    catch (error) {
        console.error(chalk.red(`✗ Error creating worktree: ${error}`));
        process.exit(1);
    }
});
// List worktrees command
program
    .command('list')
    .description('List all current worktrees')
    .option('-p, --path <path>', `Path to worktrees directory (default: ${defaultWorktreesPath})`, defaultWorktreesPath)
    .action(async (options) => {
    try {
        const worktrees = await worktreeManager.listWorktrees(options.path);
        if (worktrees.length === 0) {
            console.log(chalk.yellow('No worktrees found.'));
            return;
        }
        console.log(chalk.blue('\nCurrent worktrees:'));
        console.log(chalk.blue('─'.repeat(50)));
        worktrees.forEach((worktree, index) => {
            console.log(chalk.cyan(`${index + 1}. ${worktree.name}`));
            console.log(`   Path: ${worktree.path}`);
            console.log(`   Branch: ${worktree.branch}`);
            console.log(`   Status: ${worktree.status}`);
            console.log('');
        });
    }
    catch (error) {
        console.error(chalk.red(`✗ Error listing worktrees: ${error}`));
        process.exit(1);
    }
});
// Merge worktrees command
program
    .command('merge')
    .description('Merge multiple worktrees by paths')
    .argument('<paths...>', 'Paths to worktrees to merge')
    .option('-t, --target <target>', 'Target branch to merge into (default: main)', 'main')
    .option('-m, --message <message>', 'Merge commit message')
    .action(async (paths, options) => {
    try {
        const message = options.message || `Merge worktrees: ${paths.join(', ')}`;
        await worktreeManager.mergeWorktrees(paths, options.target, message);
        console.log(chalk.green(`✓ Worktrees merged successfully into ${options.target}`));
    }
    catch (error) {
        console.error(chalk.red(`✗ Error merging worktrees: ${error}`));
        process.exit(1);
    }
});
// Remove worktree command
program
    .command('remove')
    .description('Remove a worktree')
    .argument('<feature>', 'Feature name of the worktree to remove')
    .option('-p, --path <path>', `Path to worktrees directory (default: ${defaultWorktreesPath})`, defaultWorktreesPath)
    .option('-f, --force', 'Force removal without confirmation')
    .action(async (feature, options) => {
    try {
        await worktreeManager.removeWorktree(feature, options.path, options.force);
        console.log(chalk.green(`✓ Worktree removed successfully: ${feature}`));
    }
    catch (error) {
        console.error(chalk.red(`✗ Error removing worktree: ${error}`));
        process.exit(1);
    }
});
// Clean worktrees command
program
    .command('clean')
    .description('Clean up merged worktrees')
    .option('-p, --path <path>', `Path to worktrees directory (default: ${defaultWorktreesPath})`, defaultWorktreesPath)
    .option('-f, --force', 'Force cleanup without confirmation')
    .action(async (options) => {
    try {
        const removed = await worktreeManager.cleanWorktrees(options.path, options.force);
        console.log(chalk.green(`✓ Cleaned up ${removed} worktrees`));
    }
    catch (error) {
        console.error(chalk.red(`✗ Error cleaning worktrees: ${error}`));
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=index.js.map