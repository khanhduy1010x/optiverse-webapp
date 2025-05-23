import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FolderItem } from '../../types/note.types';
import { NoteFolderService } from '../../services/NoteFolderService';

interface FolderState {
  folders: FolderItem[];
  folderStack: FolderItem[];
  loading: boolean;
  error: string | null;
}

const initialState: FolderState = {
  folders: [],
  folderStack: [],
  loading: false,
  error: null,
};

export const fetchFolders = createAsyncThunk('folders/fetchFolders', async () => {
  return await NoteFolderService.getAllRootFolder();
});

export const createFolder = createAsyncThunk(
  'folders/createFolder',
  async ({ parentId, name }: { parentId: string | null; name: string }) => {
    return await NoteFolderService.handleAddFolder(parentId, name);
  }
);

export const deleteFolder = createAsyncThunk('folders/deleteFolder', async (folder: FolderItem) => {
  await NoteFolderService.handleDeleteFolder(folder);
  return folder._id;
});

export const renameFolder = createAsyncThunk(
  'folders/renameFolder',
  async ({ name, id }: { name: string; id: string }) => {
    await NoteFolderService.handleRenameFolder(name, id);
    return { id, name };
  }
);

const folderSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    setFolderStack: (state, action) => {
      state.folderStack = action.payload;
    },
    pushFolderStack: (state, action) => {
      state.folderStack.push(action.payload);
    },
    popFolderStack: (state) => {
      state.folderStack.pop();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
        state.loading = false;
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch folders';
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.push(action.payload);
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create folder';
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter((folder) => folder._id !== action.payload);
        state.folderStack = state.folderStack.filter((folder) => folder._id !== action.payload);
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete folder';
      })
      .addCase(renameFolder.fulfilled, (state, action) => {
        const { id, name } = action.payload;
        const index = state.folders.findIndex((folder) => folder._id === id);
        if (index !== -1) {
          state.folders[index].name = name;
        }
        const stackIndex = state.folderStack.findIndex((folder) => folder._id === id);
        if (stackIndex !== -1) {
          state.folderStack[stackIndex].name = name;
        }
      })
      .addCase(renameFolder.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to rename folder';
      });
  },
});

export const { setFolderStack, pushFolderStack, popFolderStack } = folderSlice.actions;
export default folderSlice.reducer;