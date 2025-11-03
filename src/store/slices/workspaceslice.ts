import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WorkspaceState } from '../../types/workspace/workspace.types';
import {
  MyWorkspaceItem,
  MyWorkspacesResponse,
  Workspace,
} from '../../types/workspace/response/workspace.response';
import workspaceService from '../../services/workspace.service';

const initialState: WorkspaceState = {
  workspaces: [], // Combined list for backward compatibility
  ownerWorkspaces: [],
  memberWorkspaces: [],
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
    setWorkspaces: (state, action: PayloadAction<MyWorkspacesResponse>) => {
      state.ownerWorkspaces = action.payload.owner_workspace;
      state.memberWorkspaces = action.payload.member_workspace;
      // Combine for backward compatibility
      state.workspaces = [
        ...action.payload.owner_workspace,
        ...action.payload.member_workspace,
      ];
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
      // Add to combined list
      state.workspaces.push(action.payload);

      // Add to appropriate category based on role
      if (action.payload.role === 'admin') {
        // For new workspaces, if user is admin, they're likely the owner
        state.ownerWorkspaces.push(action.payload);
      } else {
        state.memberWorkspaces.push(action.payload);
      }
    },
    updateWorkspace: (state, action: PayloadAction<Workspace>) => {
      // Update in combined list
      const index = state.workspaces.findIndex(
        item => item.workspace._id === action.payload._id
      );
      if (index !== -1) {
        state.workspaces[index].workspace = action.payload;
      }

      // Update in owner workspaces
      const ownerIndex = state.ownerWorkspaces.findIndex(
        item => item.workspace._id === action.payload._id
      );
      if (ownerIndex !== -1) {
        state.ownerWorkspaces[ownerIndex].workspace = action.payload;
      }

      // Update in member workspaces
      const memberIndex = state.memberWorkspaces.findIndex(
        item => item.workspace._id === action.payload._id
      );
      if (memberIndex !== -1) {
        state.memberWorkspaces[memberIndex].workspace = action.payload;
      }

      // Update current workspace if it matches
      if (state.currentWorkspace?._id === action.payload._id) {
        state.currentWorkspace = action.payload;
      }
    },
    removeWorkspace: (state, action: PayloadAction<string>) => {
      // Remove from combined list
      state.workspaces = state.workspaces.filter(
        item => item.workspace._id !== action.payload
      );

      // Remove from owner workspaces
      state.ownerWorkspaces = state.ownerWorkspaces.filter(
        item => item.workspace._id !== action.payload
      );

      // Remove from member workspaces
      state.memberWorkspaces = state.memberWorkspaces.filter(
        item => item.workspace._id !== action.payload
      );

      // Clear current workspace if it matches
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
        state.ownerWorkspaces = action.payload.owner_workspace;
        state.memberWorkspaces = action.payload.member_workspace;
        // Combine for backward compatibility
        state.workspaces = [
          ...action.payload.owner_workspace,
          ...action.payload.member_workspace,
        ];
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
