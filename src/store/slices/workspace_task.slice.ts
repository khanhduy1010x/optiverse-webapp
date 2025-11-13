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
      console.log('[Redux] getTasksByWorkspace called with workspaceId:', workspaceId);
      const response = await workspaceTaskService.getTasksByWorkspace(workspaceId);
      console.log('[Redux] getTasksByWorkspace response:', response);
      return response;
    } catch (error: any) {
      console.error('[Redux] getTasksByWorkspace error:', error);
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
      // Return full error data including details and upgrade info
      const errorData = error?.response?.data || {};
      const errorMessage = errorData?.message || error?.message || 'Failed to create task';
      
      console.error('[createTask] Error:', errorMessage, error);
      console.error('[createTask] Full error data:', errorData);
      
      // Return the complete error object so modal can access details
      return rejectWithValue({
        message: errorMessage,
        error: errorData?.error,
        details: errorData?.details,
        upgrade: errorData?.upgrade,
        originalError: error,
      });
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
    { workspaceId, taskId, userId, userIds }: { workspaceId: string; taskId: string; userId?: string; userIds?: string[] },
    { rejectWithValue },
  ) => {
    try {
      // Support both single userId (legacy) and userIds array (new)
      const ids = userIds || (userId ? [userId] : []);
      const response = await workspaceTaskService.assignTask(workspaceId, taskId, ids);
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
        console.log('[Redux] getTasksByWorkspace pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasksByWorkspace.fulfilled, (state, action) => {
        console.log('[Redux] getTasksByWorkspace fulfilled, tasks:', action.payload);
        state.loading = false;
        state.tasks = action.payload;
        // Organize by status
        state.tasksByStatus = {
          'to-do': action.payload.filter((t) => t.status === 'to-do'),
          'in-progress': action.payload.filter((t) => t.status === 'in-progress'),
          done: action.payload.filter((t) => t.status === 'done'),
        };
        console.log('[Redux] tasksByStatus updated:', state.tasksByStatus);
      })
      .addCase(getTasksByWorkspace.rejected, (state, action) => {
        console.error('[Redux] getTasksByWorkspace rejected:', action.payload);
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

    // assignTask, updateTaskStatus
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
      });
  },
});

export const { clearError, setCurrentTask } = workspaceTaskSlice.actions;
export default workspaceTaskSlice.reducer;
