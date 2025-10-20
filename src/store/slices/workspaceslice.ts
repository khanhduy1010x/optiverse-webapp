import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkspaceState } from '../../types/workspace/workspace.types';
import {
  MyWorkspaceItem,
  Workspace,
} from '../../types/workspace/response/workspace.response';
import workspaceService from '../../services/workspace.service';

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  error: null,
};

export const getAllWorkspaces = createAsyncThunk(
  'workspace/getAllWorkspaces',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workspaceService.getMyWorkspaces();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch workspaces');
    }
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<MyWorkspaceItem[]>) => {
      state.workspaces = action.payload;
    },
    setCurrentWorkspace: (state, action: PayloadAction<Workspace | null>) => {
      state.currentWorkspace = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addWorkspace: (state, action: PayloadAction<MyWorkspaceItem>) => {
      state.workspaces.push(action.payload);
    },
    updateWorkspace: (state, action: PayloadAction<Workspace>) => {
      const index = state.workspaces.findIndex(
        item => item.workspace._id === action.payload._id
      );
      if (index !== -1) {
        state.workspaces[index].workspace = action.payload;
      }
      if (state.currentWorkspace?._id === action.payload._id) {
        state.currentWorkspace = action.payload;
      }
    },
    removeWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter(
        item => item.workspace._id !== action.payload
      );
      if (state.currentWorkspace?._id === action.payload) {
        state.currentWorkspace = null;
      }
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAllWorkspaces.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload;
        state.error = null;
      })
      .addCase(getAllWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setWorkspaces,
  setCurrentWorkspace,
  setLoading,
  setError,
  addWorkspace,
  updateWorkspace,
  removeWorkspace,
  clearError,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
