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
    createWorktree(feature: string, worktreesPath: string, branch: string): Promise<void>;
    listWorktrees(worktreesPath: string): Promise<WorktreeInfo[]>;
    private getWorktreeStatus;
    mergeWorktrees(paths: string[], targetBranch: string, message: string): Promise<void>;
    removeWorktree(feature: string, worktreesPath: string, force?: boolean): Promise<void>;
    cleanWorktrees(worktreesPath: string, force?: boolean): Promise<number>;
}
//# sourceMappingURL=worktree-manager.d.ts.map