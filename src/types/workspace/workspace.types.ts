import {
  MyWorkspaceItem,
  MyWorkspacesResponse,
  Workspace,
} from './response/workspace.response';

export interface WorkspaceState {
  workspaces: MyWorkspaceItem[];
  ownerWorkspaces: MyWorkspaceItem[];
  memberWorkspaces: MyWorkspaceItem[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;
}
