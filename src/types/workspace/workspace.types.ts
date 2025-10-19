import { MyWorkspaceItem, Workspace } from './response/workspace.response';

export interface WorkspaceState {
  workspaces: MyWorkspaceItem[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;
}
