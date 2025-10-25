import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EnvCopier } from '../src/env-copier.js';

describe('EnvCopier', () => {
  let tempDir: string;
  let sourceDir: string;
  let targetDir: string;
  let envCopier: EnvCopier;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'env-copier-test-'));
    sourceDir = join(tempDir, 'source');
    targetDir = join(tempDir, 'target');

    // Create directories
    require('fs').mkdirSync(sourceDir, { recursive: true });
    require('fs').mkdirSync(targetDir, { recursive: true });

    envCopier = new EnvCopier();
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should copy existing env files', async () => {
    // Create test env files
    writeFileSync(join(sourceDir, '.env'), 'TEST_VAR=value');
    writeFileSync(join(sourceDir, '.env.local'), 'LOCAL_VAR=local');

    const copiedCount = await envCopier.copyEnvFiles(sourceDir, targetDir);

    expect(copiedCount).toBe(2);
    expect(require('fs').existsSync(join(targetDir, '.env'))).toBe(true);
    expect(require('fs').existsSync(join(targetDir, '.env.local'))).toBe(true);
  });

  it('should handle non-existent env files gracefully', async () => {
    const copiedCount = await envCopier.copyEnvFiles(sourceDir, targetDir);

    expect(copiedCount).toBe(0);
  });

  it('should copy only existing env files', async () => {
    // Create only one env file
    writeFileSync(join(sourceDir, '.env'), 'TEST_VAR=value');

    const copiedCount = await envCopier.copyEnvFiles(sourceDir, targetDir);

    expect(copiedCount).toBe(1);
    expect(require('fs').existsSync(join(targetDir, '.env'))).toBe(true);
    expect(require('fs').existsSync(join(targetDir, '.env.local'))).toBe(false);
  });
});
