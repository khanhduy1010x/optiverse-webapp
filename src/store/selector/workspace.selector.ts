import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { WorkspaceState } from '../../types/workspace/workspace.types';

const selectWorkspaceState = (state: RootState): WorkspaceState =>
  state.workspace;

export const selectWorkspaces = createSelector(
  selectWorkspaceState,
  workspace => workspace.workspaces
);

export const selectCurrentWorkspace = createSelector(
  selectWorkspaceState,
  workspace => workspace.currentWorkspace
);

export const selectWorkspaceLoading = createSelector(
  selectWorkspaceState,
  workspace => workspace.loading
);

export const selectWorkspaceError = createSelector(
  selectWorkspaceState,
  workspace => workspace.error
);

// Derived selectors
export const selectWorkspaceList = createSelector(
  selectWorkspaces,
  workspaces => workspaces.map(item => item.workspace)
);

export const selectWorkspaceCount = createSelector(
  selectWorkspaces,
  workspaces => workspaces.filter(item => item.status === 'accepted').length
);

export const selectWorkspaceById = createSelector(
  [selectWorkspaces, (_, workspaceId: string) => workspaceId],
  (workspaces, workspaceId) =>
    workspaces.find(item => item.workspace._id === workspaceId)
);

export const selectUserWorkspaceRole = createSelector(
  [selectWorkspaces, (_, workspaceId: string) => workspaceId],
  (workspaces, workspaceId) => {
    const workspaceItem = workspaces.find(
      item => item.workspace._id === workspaceId
    );
    return workspaceItem?.role || null;
  }
);

export const selectAdminWorkspaces = createSelector(
  selectWorkspaces,
  workspaces => workspaces.filter(item => item.role === 'admin' && item.status === 'accepted')
);

export const selectMemberWorkspaces = createSelector(
  selectWorkspaces,
  workspaces => workspaces.filter(item => item.role === 'user' && item.status === 'accepted')
);

export const selectWorkspaceNames = createSelector(
  selectWorkspaces,
  workspaces => {
    if (!workspaces) return [];
    return workspaces
      .filter(item => item.status === 'accepted') // Lọc ra workspace bị ban
      .map(item => ({
        id: item?.workspace?._id,
        name: item?.workspace?.name,
      }))
      .filter(item => item.id && item.name);
  }
);

export const selectIsCurrentWorkspaceAdmin = createSelector(
  [selectWorkspaces, selectCurrentWorkspace],
  (workspaces, currentWorkspace) => {
    if (!currentWorkspace?._id) return false;
    const workspaceItem = workspaces.find(
      item => item.workspace._id === currentWorkspace._id
    );
    return workspaceItem?.role === 'admin';
  }
);

export const selectHasWorkspaces = createSelector(
  selectWorkspaces,
  workspaces => workspaces.filter(item => item.status === 'accepted').length > 0
);

export const selectWorkspaceLoadingState = createSelector(
  [selectWorkspaceLoading, selectWorkspaceError],
  (loading, error) => ({
    loading,
    error,
    hasError: !!error,
  })
);

export const selectWorkspaceForDropdown = createSelector(
  selectWorkspaces,
  workspaces => [
    { id: 'home', name: 'Home' },
    ...(workspaces
      ?.filter(item => item.status === 'accepted') // Lọc ra workspace bị ban
      .map(item => ({
        id: item?.workspace?._id,
        name: item?.workspace?.name,
      }))
      .filter(item => item.id && item.name) || [])
  ]
);
