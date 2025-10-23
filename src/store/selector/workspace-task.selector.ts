import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

const selectWorkspaceTaskState = (state: RootState) => state.workspaceTask;

export const selectAllTasks = createSelector(
  selectWorkspaceTaskState,
  (state) => state.tasks,
);

export const selectTasksByStatus = createSelector(
  selectWorkspaceTaskState,
  (state) => state.tasksByStatus,
);

export const selectTasksToDoStatus = createSelector(
  selectWorkspaceTaskState,
  (state) => state.tasksByStatus['to-do'],
);

export const selectTasksInProgressStatus = createSelector(
  selectWorkspaceTaskState,
  (state) => state.tasksByStatus['in-progress'],
);

export const selectTasksDoneStatus = createSelector(
  selectWorkspaceTaskState,
  (state) => state.tasksByStatus.done,
);

export const selectCurrentTask = createSelector(
  selectWorkspaceTaskState,
  (state) => state.currentTask,
);

export const selectWorkspaceTaskLoading = createSelector(
  selectWorkspaceTaskState,
  (state) => state.loading,
);

export const selectWorkspaceTaskError = createSelector(
  selectWorkspaceTaskState,
  (state) => state.error,
);
