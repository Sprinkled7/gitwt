import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PackageInstaller } from '../src/package-installer.js';

// Mock detect-package-manager
vi.mock('detect-package-manager', () => ({
  detect: vi.fn(),
}));

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

describe('PackageInstaller', () => {
  let tempDir: string;
  let packageInstaller: PackageInstaller;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'package-installer-test-'));
    packageInstaller = new PackageInstaller();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  it('should detect npm package manager', async () => {
    const { detect } = await import('detect-package-manager');
    const { execa } = await import('execa');

    vi.mocked(detect).mockResolvedValue('npm');
    vi.mocked(execa).mockResolvedValue({ stdout: '', stderr: '' } as any);

    // Create package.json
    writeFileSync(join(tempDir, 'package.json'), '{"name": "test"}');
    writeFileSync(join(tempDir, 'package-lock.json'), '{}');

    const result = await packageInstaller.installPackages(tempDir);

    expect(result).toBe(true);
    expect(detect).toHaveBeenCalledWith({ cwd: tempDir });
    expect(execa).toHaveBeenCalledWith('npm', ['install'], {
      cwd: tempDir,
      stdio: 'inherit',
    });
  });

  it('should handle missing package.json', async () => {
    const result = await packageInstaller.installPackages(tempDir);

    expect(result).toBe(false);
  });

  it('should handle unsupported package manager', async () => {
    const { detect } = await import('detect-package-manager');

    vi.mocked(detect).mockResolvedValue('unsupported');

    // Create package.json
    writeFileSync(join(tempDir, 'package.json'), '{"name": "test"}');

    const result = await packageInstaller.installPackages(tempDir);

    expect(result).toBe(false);
  });
});
