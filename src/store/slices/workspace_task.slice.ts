import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkspaceTask } from '../../types/workspace-task/workspace-task.types';
import workspaceTaskService from '../../services/workspace-task.service';

export interface WorkspaceTaskState {
  tasks: WorkspaceTask[];
  tasksByStatus: {
    'to-do': WorkspaceTask[];
    'in-progress': WorkspaceTask[];
    done: WorkspaceTask[];
  };
  currentTask: WorkspaceTask | null;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceTaskState = {
  tasks: [],
  tasksByStatus: {
    'to-do': [],
    'in-progress': [],
    done: [],
  },
  currentTask: null,
  loading: false,
  error: null,
};

// ========== Async Thunks ==========
export const getTasksByWorkspace = createAsyncThunk(
  'workspaceTask/getByWorkspace',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await workspaceTaskService.getTasksByWorkspace(workspaceId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  },
);

export const getTaskById = createAsyncThunk(
  'workspaceTask/getById',
  async ({ workspaceId, taskId }: { workspaceId: string; taskId: string }, { rejectWithValue }) => {
    try {
      const response = await workspaceTaskService.getTaskById(workspaceId, taskId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch task');
    }
  },
);

export const createTask = createAsyncThunk(
  'workspaceTask/create',
  async (
    { workspaceId, data }: { workspaceId: string; data: any },
    { rejectWithValue },
  ) => {
    try {
      const response = await workspaceTaskService.createTask(workspaceId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create task');
    }
  },
);

export const updateTask = createAsyncThunk(
  'workspaceTask/update',
  async (
    { workspaceId, taskId, data }: { workspaceId: string; taskId: string; data: any },
    { rejectWithValue },
  ) => {
    try {
      const response = await workspaceTaskService.updateTask(workspaceId, taskId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task');
    }
  },
);

export const deleteTask = createAsyncThunk(
  'workspaceTask/delete',
  async ({ workspaceId, taskId }: { workspaceId: string; taskId: string }, { rejectWithValue }) => {
    try {
      await workspaceTaskService.deleteTask(workspaceId, taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete task');
    }
  },
);

export const assignTask = createAsyncThunk(
  'workspaceTask/assign',
  async (
    { workspaceId, taskId, userId }: { workspaceId: string; taskId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await workspaceTaskService.assignTask(workspaceId, taskId, userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign task');
    }
  },
);

export const updateTaskStatus = createAsyncThunk(
  'workspaceTask/updateStatus',
  async (
    { workspaceId, taskId, status }: { workspaceId: string; taskId: string; status: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await workspaceTaskService.updateTaskStatus(workspaceId, taskId, status);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update task status');
    }
  },
);

export const createSubtask = createAsyncThunk(
  'workspaceTask/createSubtask',
  async (
    { workspaceId, taskId, data }: { workspaceId: string; taskId: string; data: any },
    { rejectWithValue },
  ) => {
    try {
      const response = await workspaceTaskService.createSubtask(workspaceId, taskId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create subtask');
    }
  },
);

export const updateSubtask = createAsyncThunk(
  'workspaceTask/updateSubtask',
  async (
    {
      workspaceId,
      taskId,
      subtaskId,
      data,
    }: { workspaceId: string; taskId: string; subtaskId: string; data: any },
    { rejectWithValue },
  ) => {
    try {
      const response = await workspaceTaskService.updateSubtask(
        workspaceId,
        taskId,
        subtaskId,
        data,
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update subtask');
    }
  },
);

export const deleteSubtask = createAsyncThunk(
  'workspaceTask/deleteSubtask',
  async (
    { workspaceId, taskId, subtaskId }: { workspaceId: string; taskId: string; subtaskId: string },
    { rejectWithValue },
  ) => {
    try {
      await workspaceTaskService.deleteSubtask(workspaceId, taskId, subtaskId);
      return { taskId, subtaskId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete subtask');
    }
  },
);

export const updateSubtaskStatus = createAsyncThunk(
  'workspaceTask/updateSubtaskStatus',
  async (
    {
      workspaceId,
      taskId,
      subtaskId,
      status,
    }: { workspaceId: string; taskId: string; subtaskId: string; status: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await workspaceTaskService.updateSubtaskStatus(
        workspaceId,
        taskId,
        subtaskId,
        status,
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update subtask status');
    }
  },
);

// ========== Slice ==========
const workspaceTaskSlice = createSlice({
  name: 'workspaceTask',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTask: (state, action: PayloadAction<WorkspaceTask | null>) => {
      state.currentTask = action.payload;
    },
  },
  extraReducers: (builder) => {
    // getTasksByWorkspace
    builder
      .addCase(getTasksByWorkspace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasksByWorkspace.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        // Organize by status
        state.tasksByStatus = {
          'to-do': action.payload.filter((t) => t.status === 'to-do'),
          'in-progress': action.payload.filter((t) => t.status === 'in-progress'),
          done: action.payload.filter((t) => t.status === 'done'),
        };
      })
      .addCase(getTasksByWorkspace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // getTaskById
    builder
      .addCase(getTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createTask
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        const status = action.payload.status;
        state.tasksByStatus[status as keyof typeof state.tasksByStatus].push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateTask
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        // Reorganize by status
        state.tasksByStatus = {
          'to-do': state.tasks.filter((t) => t.status === 'to-do'),
          'in-progress': state.tasks.filter((t) => t.status === 'in-progress'),
          done: state.tasks.filter((t) => t.status === 'done'),
        };
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deleteTask
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        // Reorganize by status
        state.tasksByStatus = {
          'to-do': state.tasks.filter((t) => t.status === 'to-do'),
          'in-progress': state.tasks.filter((t) => t.status === 'in-progress'),
          done: state.tasks.filter((t) => t.status === 'done'),
        };
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // assignTask, updateTaskStatus, createSubtask, updateSubtask, deleteSubtask, updateSubtaskStatus
    builder
      .addCase(assignTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        state.tasksByStatus = {
          'to-do': state.tasks.filter((t) => t.status === 'to-do'),
          'in-progress': state.tasks.filter((t) => t.status === 'in-progress'),
          done: state.tasks.filter((t) => t.status === 'done'),
        };
      })
      .addCase(createSubtask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateSubtask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(deleteSubtask.fulfilled, (state, action) => {
        const taskIndex = state.tasks.findIndex((t) => t._id === action.payload.taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].subtasks = state.tasks[taskIndex].subtasks.filter(
            (st) => st._id !== action.payload.subtaskId,
          );
          if (state.currentTask?._id === state.tasks[taskIndex]._id) {
            state.currentTask = state.tasks[taskIndex];
          }
        }
      })
      .addCase(updateSubtaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentTask } = workspaceTaskSlice.actions;
export default workspaceTaskSlice.reducer;
