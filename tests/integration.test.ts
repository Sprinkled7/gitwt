import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorktreeManager } from '../src/worktree-manager.js';

// Mock execa for git commands
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

describe('WorktreeManager Integration', () => {
  let tempDir: string;
  let worktreesPath: string;
  let worktreeManager: WorktreeManager;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'worktree-integration-test-'));
    worktreesPath = join(tempDir, 'worktrees');
    worktreeManager = new WorktreeManager();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  it('should create worktree with env files and package installation', async () => {
    const { execa } = await import('execa');

    // Mock git commands
    vi.mocked(execa).mockImplementation(async (command, args, options) => {
      if (command === 'git') {
        if (args?.includes('rev-parse')) {
          if (args.includes('--git-dir')) {
            return { stdout: '.git', stderr: '' } as any;
          }
          if (args.includes('--show-toplevel')) {
            return { stdout: tempDir, stderr: '' } as any;
          }
          if (args.includes('--git-common-dir')) {
            return { stdout: tempDir, stderr: '' } as any;
          }
        }
        if (args?.includes('worktree') && args?.includes('add')) {
          // Simulate successful worktree creation by creating the directory
          const worktreePath = args[args.length - 1]; // Last argument is the path
          mkdirSync(worktreePath, { recursive: true });
          return { stdout: '', stderr: '' } as any;
        }
        if (args?.includes('config --get remote.origin.url')) {
          return {
            stdout: 'https://github.com/test/project.git',
            stderr: '',
          } as any;
        }
      }
      throw new Error(`Unexpected command: ${command} ${args?.join(' ')}`);
    });

    // Create test env files in the main repo
    writeFileSync(join(tempDir, '.env'), 'TEST_VAR=value');
    writeFileSync(join(tempDir, '.env.local'), 'LOCAL_VAR=local');

    // Create package.json in the main repo
    writeFileSync(join(tempDir, 'package.json'), '{"name": "test"}');
    writeFileSync(join(tempDir, 'package-lock.json'), '{}');

    await worktreeManager.createWorktree(
      'test-feature',
      worktreesPath,
      'feature/test',
      {
        copyEnvFiles: true,
        installPackages: true,
      }
    );

    // Verify worktree was created
    expect(existsSync(join(worktreesPath, 'project-test-feature'))).toBe(true);
  });

  it('should create worktree without post-creation tasks when disabled', async () => {
    const { execa } = await import('execa');

    // Mock git commands
    vi.mocked(execa).mockImplementation(async (command, args, options) => {
      if (command === 'git') {
        if (args?.includes('rev-parse')) {
          if (args.includes('--git-dir')) {
            return { stdout: '.git', stderr: '' } as any;
          }
          if (args.includes('--show-toplevel')) {
            return { stdout: tempDir, stderr: '' } as any;
          }
          if (args.includes('--git-common-dir')) {
            return { stdout: tempDir, stderr: '' } as any;
          }
        }
        if (args?.includes('worktree') && args?.includes('add')) {
          // Simulate successful worktree creation by creating the directory
          const worktreePath = args[args.length - 1]; // Last argument is the path
          mkdirSync(worktreePath, { recursive: true });
          return { stdout: '', stderr: '' } as any;
        }
        if (args?.includes('config --get remote.origin.url')) {
          return {
            stdout: 'https://github.com/test/project.git',
            stderr: '',
          } as any;
        }
      }
      throw new Error(`Unexpected command: ${command} ${args?.join(' ')}`);
    });

    await worktreeManager.createWorktree(
      'test-feature',
      worktreesPath,
      'feature/test',
      {
        copyEnvFiles: false,
        installPackages: false,
      }
    );

    // Verify worktree was created
    expect(existsSync(join(worktreesPath, 'project-test-feature'))).toBe(true);
  });
});
