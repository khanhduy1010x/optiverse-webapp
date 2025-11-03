import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { WorkspaceState } from '../../types/workspace/workspace.types';

const selectWorkspaceState = (state: RootState): WorkspaceState =>
  state.workspace;

export const selectWorkspaces = createSelector(
  selectWorkspaceState,
  workspace => workspace.workspaces
);

export const selectOwnerWorkspaces = createSelector(
  selectWorkspaceState,
  workspace => workspace.ownerWorkspaces
);

export const selectMemberWorkspaces = createSelector(
  selectWorkspaceState,
  workspace => workspace.memberWorkspaces
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
  workspaces => workspaces.filter(item => item.status === 'active').length
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
  selectOwnerWorkspaces,
  ownerWorkspaces =>
    ownerWorkspaces.filter(
      item => item.role === 'admin' && item.status === 'active'
    )
);

export const selectUserMemberWorkspaces = createSelector(
  selectMemberWorkspaces,
  memberWorkspaces =>
    memberWorkspaces.filter(
      item => item.role === 'user' && item.status === 'active'
    )
);

export const selectWorkspaceNames = createSelector(
  selectWorkspaces,
  workspaces => {
    if (!workspaces) return [];
    return workspaces
      .filter(item => item.status === 'active') // Lọc ra workspace bị ban
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
  workspaces => workspaces.filter(item => item.status === 'active').length > 0
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
      ?.filter(item => item.status === 'active')
      .map(item => ({
        id: item?.workspace?._id,
        name: item?.workspace?.name,
      }))
      .filter(item => item.id && item.name) || []),
  ]
);

// New selectors for owner/member specific data
export const selectOwnerWorkspaceCount = createSelector(
  selectOwnerWorkspaces,
  ownerWorkspaces =>
    ownerWorkspaces.filter(item => item.status === 'active').length
);

export const selectMemberWorkspaceCount = createSelector(
  selectMemberWorkspaces,
  memberWorkspaces =>
    memberWorkspaces.filter(item => item.status === 'active').length
);

export const selectTotalWorkspaceCount = createSelector(
  [selectOwnerWorkspaceCount, selectMemberWorkspaceCount],
  (ownerCount, memberCount) => ownerCount + memberCount
);

export const selectIsOwner = createSelector(
  [selectOwnerWorkspaces, (_, workspaceId: string) => workspaceId],
  (ownerWorkspaces, workspaceId) =>
    ownerWorkspaces.some(item => item.workspace._id === workspaceId)
);

export const selectOwnerWorkspaceNames = createSelector(
  selectOwnerWorkspaces,
  ownerWorkspaces => {
    if (!ownerWorkspaces) return [];
    return ownerWorkspaces
      .filter(item => item.status === 'active')
      .map(item => ({
        id: item?.workspace?._id,
        name: item?.workspace?.name,
        role: 'owner' as const,
        locked: item?.locked || false,
      }))
      .filter(item => item.id && item.name);
  }
);

export const selectMemberWorkspaceNames = createSelector(
  selectMemberWorkspaces,
  memberWorkspaces => {
    if (!memberWorkspaces) return [];
    return memberWorkspaces
      .filter(item => item.status === 'active')
      .map(item => ({
        id: item?.workspace?._id,
        name: item?.workspace?.name,
        role: item?.role || ('member' as const),
        locked: item?.locked || false,
      }))
      .filter(item => item.id && item.name);
  }
);
