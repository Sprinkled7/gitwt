export const CONFIG = {
  ENV_FILES: [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    '.env.test',
    '.env.example',
  ],
  PACKAGE_MANAGERS: {
    npm: {
      name: 'npm',
      command: 'npm install',
      lockFile: 'package-lock.json',
    },
    yarn: {
      name: 'yarn',
      command: 'yarn install',
      lockFile: 'yarn.lock',
    },
    pnpm: {
      name: 'pnpm',
      command: 'pnpm install',
      lockFile: 'pnpm-lock.yaml',
    },
  },
  DEFAULT_OPTIONS: {
    copyEnvFiles: true,
    installPackages: true,
  },
} as const;
