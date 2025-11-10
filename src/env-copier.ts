import chalk from 'chalk';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { CONFIG } from './config.js';
import { EnvFileInfo } from './types.js';

export class EnvCopier {
  private async copyEnvFile(
    sourcePath: string,
    targetPath: string
  ): Promise<boolean> {
    try {
      if (existsSync(sourcePath)) {
        copyFileSync(sourcePath, targetPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        chalk.yellow(`Warning: Failed to copy ${sourcePath}: ${error}`)
      );
      return false;
    }
  }

  private getEnvFilesInfo(sourceDir: string, targetDir: string): EnvFileInfo[] {
    return CONFIG.ENV_FILES.map((envFile) => {
      const sourcePath = join(sourceDir, envFile);
      const targetPath = join(targetDir, envFile);
      return {
        sourcePath,
        targetPath,
        exists: existsSync(sourcePath),
      };
    });
  }

  async copyEnvFiles(sourceDir: string, targetDir: string): Promise<number> {
    const envFiles = this.getEnvFilesInfo(sourceDir, targetDir);
    let copiedCount = 0;

    for (const envFile of envFiles) {
      if (envFile.exists) {
        const success = await this.copyEnvFile(
          envFile.sourcePath,
          envFile.targetPath
        );
        if (success) {
          copiedCount++;
          console.log(
            chalk.blue(`✓ Copied ${envFile.sourcePath.split('/').pop()}`)
          );
        }
      }
    }

    if (copiedCount === 0) {
      console.log(chalk.yellow('No environment files found to copy'));
    } else {
      console.log(chalk.green(`✓ Copied ${copiedCount} environment file(s)`));
    }

    return copiedCount;
  }
}
