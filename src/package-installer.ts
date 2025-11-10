import chalk from 'chalk';
import { detect } from 'detect-package-manager';
import { execa } from 'execa';
import { existsSync } from 'fs';
import { join } from 'path';
import { CONFIG } from './config.js';
import { PackageManagerInfo } from './types.js';

export class PackageInstaller {
  private async detectPackageManager(
    worktreePath: string
  ): Promise<PackageManagerInfo | null> {
    try {
      const packageJsonPath = join(worktreePath, 'package.json');
      if (!existsSync(packageJsonPath)) {
        return null;
      }

      const detectedManager = await detect({ cwd: worktreePath });
      const managerConfig =
        CONFIG.PACKAGE_MANAGERS[
          detectedManager as keyof typeof CONFIG.PACKAGE_MANAGERS
        ];

      if (!managerConfig) {
        console.log(
          chalk.yellow(`Unsupported package manager: ${detectedManager}`)
        );
        return null;
      }

      return managerConfig;
    } catch (error) {
      console.error(
        chalk.yellow(`Warning: Failed to detect package manager: ${error}`)
      );
      return null;
    }
  }

  private async checkLockFile(
    worktreePath: string,
    manager: PackageManagerInfo
  ): Promise<boolean> {
    const lockFilePath = join(worktreePath, manager.lockFile);
    return existsSync(lockFilePath);
  }

  private async runInstallCommand(
    worktreePath: string,
    manager: PackageManagerInfo
  ): Promise<boolean> {
    try {
      const [command, ...args] = manager.command.split(' ');

      console.log(chalk.blue(`Installing packages with ${manager.name}...`));

      await execa(command, args, {
        cwd: worktreePath,
        stdio: 'inherit',
      });

      console.log(
        chalk.green(`✓ Packages installed successfully with ${manager.name}`)
      );
      return true;
    } catch (error) {
      console.error(
        chalk.red(`✗ Failed to install packages with ${manager.name}: ${error}`)
      );
      return false;
    }
  }

  async installPackages(worktreePath: string): Promise<boolean> {
    const manager = await this.detectPackageManager(worktreePath);

    if (!manager) {
      console.log(
        chalk.yellow('No package manager detected or package.json not found')
      );
      return false;
    }

    const hasLockFile = await this.checkLockFile(worktreePath, manager);

    if (!hasLockFile) {
      console.log(
        chalk.yellow(`No ${manager.lockFile} found. Installing packages...`)
      );
    } else {
      console.log(
        chalk.blue(`Found ${manager.lockFile}. Installing packages...`)
      );
    }

    return await this.runInstallCommand(worktreePath, manager);
  }
}
