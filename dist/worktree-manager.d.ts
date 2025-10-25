import { WorktreeOptions } from './types.js';
export interface WorktreeInfo {
    name: string;
    path: string;
    branch: string;
    status: string;
}
export declare class WorktreeManager {
    private runGitCommand;
    private ensureGitRepo;
    private getProjectName;
    createWorktree(feature: string, worktreesPath: string, branch: string, options?: WorktreeOptions): Promise<void>;
    private performPostCreationTasks;
    listWorktrees(worktreesPath: string): Promise<WorktreeInfo[]>;
    private getWorktreeStatus;
    mergeWorktrees(paths: string[], targetBranch: string, message: string): Promise<void>;
    removeWorktree(feature: string, worktreesPath: string, force?: boolean): Promise<void>;
    cleanWorktrees(worktreesPath: string, force?: boolean): Promise<number>;
    private isBranchMerged;
}
//# sourceMappingURL=worktree-manager.d.ts.map