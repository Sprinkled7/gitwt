import { execa } from 'execa';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('CLI E2E', () => {
  let tempDir: string;
  let worktreesPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'cli-e2e-test-'));
    worktreesPath = join(tempDir, 'worktrees');

    // Create a git repository
    require('fs').mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should show help information', async () => {
    const { stdout } = await execa('node', ['dist/index.js', '--help'], {
      cwd: process.cwd(),
    });

    expect(stdout).toContain('gitwt');
    expect(stdout).toContain('CLI tool for managing Git worktrees');
  });

  it('should show version information', async () => {
    const { stdout } = await execa('node', ['dist/index.js', '--version'], {
      cwd: process.cwd(),
    });

    expect(stdout).toContain('1.1.0');
  });

  it('should show new command help', async () => {
    const { stdout } = await execa('node', ['dist/index.js', 'new', '--help'], {
      cwd: process.cwd(),
    });

    expect(stdout).toContain('Create a new Git worktree for a feature');
    expect(stdout).toContain('--no-copy-env');
    expect(stdout).toContain('--no-install-packages');
  });
});
