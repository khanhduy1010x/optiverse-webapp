import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootItem } from '../../types/note/note.types';
import workspaceNoteService from '../../services/workspace-note.service';

interface WorkspaceNoteState {
  items: RootItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceNoteState = {
  items: [],
  loading: false,
  error: null,
};

/**
 * Fetch workspace note tree (folders + notes combined)
 * Calls 2 APIs: getWorkspaceFolders and getWorkspaceNotes
 * Then builds a folder tree structure
 */
export const getWorkspaceNoteTree = createAsyncThunk(
  'workspaceNote/getWorkspaceNoteTree',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const tree = await workspaceNoteService.getWorkspaceNoteTree(workspaceId);
      return tree;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch workspace note tree'
      );
    }
  }
);

const workspaceNoteSlice = createSlice({
  name: 'workspaceNote',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<RootItem[]>) => {
      state.items = action.payload;
    },
    clearItems: state => {
      state.items = [];
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getWorkspaceNoteTree.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWorkspaceNoteTree.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(getWorkspaceNoteTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setItems, clearItems, clearError } = workspaceNoteSlice.actions;

export default workspaceNoteSlice.reducer;
