export interface WorktreeOptions {
  copyEnvFiles?: boolean;
  installPackages?: boolean;
}

export interface EnvFileInfo {
  sourcePath: string;
  targetPath: string;
  exists: boolean;
}

export interface PackageManagerInfo {
  name: string;
  command: string;
  lockFile: string;
}
