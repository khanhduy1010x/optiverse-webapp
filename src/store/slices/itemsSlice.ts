import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootItem, FolderItem, NoteItem } from '../../types/note.types';
import { NoteFolderService } from '../../services/NoteFolderService';
import { NoteService } from '../../services/NoteService';

interface ItemsState {
  items: RootItem[];
  folderStack: FolderItem[];
  currentNote?: NoteItem;
  loading: boolean;
  error: string | null;
}

const initialState: ItemsState = {
  items: [],
  folderStack: [],
  currentNote: undefined,
  loading: false,
  error: null,
};

export const fetchItems = createAsyncThunk('items/fetchItems', async () => {
  return await NoteFolderService.getAllRootItems();
});

export const createFolder = createAsyncThunk(
  'items/createFolder',
  async ({ parentId, name }: { parentId: string | null; name: string }) => {
    const folder = await NoteFolderService.handleAddFolder(parentId, name);
    return { folder, parentId };
  }
);

export const createNote = createAsyncThunk(
  'items/createNote',
  async ({ parentId, title }: { parentId: string | null; title: string }) => {
    const note = await NoteService.handleCreateNote(parentId, title);
    return { note, parentId };
  }
);

export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async (item: RootItem) => {
    if (item.type === 'folder') {
      await NoteFolderService.handleDeleteFolder(item);
    } else {
      await NoteService.handleDeleteNote(item);
    }
    return {
      _id: item._id,
      parentId: item.type === 'folder' ? item.parent_folder_id : item.folder_id,
    };
  }
);

export const renameItem = createAsyncThunk(
  'items/renameItem',
  async ({ name, item }: { name: string; item: RootItem }) => {
    if (item.type === 'folder') {
      await NoteFolderService.handleRenameFolder(name, item._id);
    } else {
      await NoteService.handleRenameNote(name, item);
    }
    return {
      _id: item._id,
      name,
      parentId: item.type === 'folder' ? item.parent_folder_id : item.folder_id,
    };
  }
);

export const saveNote = createAsyncThunk(
  'items/saveNote',
  async ({
    note,
    shouldSetCurrent,
  }: {
    note: NoteItem;
    shouldSetCurrent: boolean;
  }) => {
    // Lưu ý: Chức năng này không còn được sử dụng cho realtime sync
    // Nhưng vẫn giữ lại cho các trường hợp lưu thủ công hoặc các chức năng khác
    const response = await NoteService.saveNote(note);
    return { response, shouldSetCurrent };
  }
);

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setFolderStack: (state, action) => {
      state.folderStack = action.payload;
    },
    pushFolderStack: (state, action) => {
      if (action.payload.type === 'folder') {
        state.folderStack.push(action.payload);
      }
    },
    popFolderStack: state => {
      state.folderStack.pop();
    },
    setCurrentNote: (state, action) => {
      console.log('Dispatch setCurrentNote:', {
        id: action.payload?._id,
        title: action.payload?.title,
      });
      state.currentNote = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchItems.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.items = normalizeItems(action.payload);
        state.loading = false;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch items';
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        const { folder, parentId } = action.payload;
        if (!parentId) {
          state.items.push(folder);
        } else {
          const parent = findFolder(state.items, parentId);
          if (parent) {
            parent.subfolders.push(folder);
            updateFolderStack(state, parentId, parent);
          }
        }
      })
      .addCase(createNote.fulfilled, (state, action) => {
        const { note, parentId } = action.payload;
        if (!parentId) {
          state.items.push(note);
        } else {
          const parent = findFolder(state.items, parentId);
          if (parent) {
            parent.files.push(note);
            updateFolderStack(state, parentId, parent);
          }
        }
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { _id, parentId } = action.payload;
        if (!parentId) {
          state.items = state.items.filter(item => item._id !== _id);
        } else {
          const parent = findFolder(state.items, parentId);
          if (parent) {
            parent.subfolders = parent.subfolders.filter(
              sub => sub._id !== _id
            );
            parent.files = parent.files.filter(file => file._id !== _id);
            updateFolderStack(state, parentId, parent);
          }
        }
        state.folderStack = state.folderStack.filter(item => item._id !== _id);
        if (state.currentNote?._id === _id) {
          state.currentNote = undefined;
        }
      })
      .addCase(deleteItem.rejected, (state, action) => {})
      .addCase(renameItem.fulfilled, (state, action) => {
        const { _id, name, parentId } = action.payload;
        if (!parentId) {
          const item = state.items.find(item => item._id === _id);
          if (item) {
            if (item.type === 'folder') {
              item.name = name;
            } else {
              item.title = name;
            }
          }
        } else {
          const parent = findFolder(state.items, parentId);
          if (parent) {
            const subfolder = parent.subfolders.find(sub => sub._id === _id);
            if (subfolder) {
              subfolder.name = name;
            }
            const file = parent.files.find(file => file._id === _id);
            if (file) {
              file.title = name;
            }
            updateFolderStack(state, parentId, parent);
          }
        }
        const stackItem = state.folderStack.find(item => item._id === _id);
        if (stackItem) {
          stackItem.name = name;
        }
        if (state.currentNote?._id === _id) {
          state.currentNote = { ...state.currentNote, title: name };
        }
      })
      .addCase(renameItem.rejected, (state, action) => {})
      .addCase(saveNote.fulfilled, (state, action) => {
        const { response, shouldSetCurrent } = action.payload;
        updateNoteInState(state, response);
        if (shouldSetCurrent && state.currentNote?._id === response._id) {
          state.currentNote = response;
        }
      })
      .addCase(saveNote.rejected, (state, action) => {
        console.error('Không thể lưu note:', action.error.message);
      });
  },
});

const findItem = (items: RootItem[], id: string): RootItem | undefined => {
  for (const item of items) {
    if (item._id === id) return item;
    if (item.type === 'folder') {
      const subItem = findItem([...item.subfolders, ...item.files], id);
      if (subItem) return subItem;
    }
  }
  return undefined;
};

const findFolder = (items: RootItem[], id: string): FolderItem | undefined => {
  const item = findItem(items, id);
  return item && item.type === 'folder' ? item : undefined;
};

const findFolderByFolderId = (
  items: RootItem[],
  folderId: string
): FolderItem | undefined => {
  for (const item of items) {
    if (item.type === 'folder' && item._id === folderId) {
      return item;
    }
    if (item.type === 'folder') {
      const subFolder = findFolderByFolderId(item.subfolders, folderId);
      if (subFolder) return subFolder;
    }
  }
  return undefined;
};

const updateNoteInState = (state: ItemsState, note: NoteItem) => {
  const index = state.items.findIndex(item => item._id === note._id);
  if (index !== -1) {
    state.items[index] = note;
    return;
  }
  if (note.folder_id) {
    const parent = findFolderByFolderId(state.items, note.folder_id);
    if (parent) {
      const fileIndex = parent.files.findIndex(file => file._id === note._id);
      if (fileIndex !== -1) {
        parent.files[fileIndex] = note;
        updateFolderStack(state, parent._id, parent);
        return;
      }
      parent.files.push(note);
      updateFolderStack(state, parent._id, parent);
      return;
    }
  }
  console.warn('Không tìm thấy note hoặc folder để cập nhật:', {
    id: note._id,
    folder_id: note.folder_id,
  });
};

const updateFolderStack = (
  state: ItemsState,
  folderId: string,
  updatedFolder: FolderItem
) => {
  const stackIndex = state.folderStack.findIndex(
    folder => folder._id === folderId
  );
  if (stackIndex !== -1) {
    state.folderStack[stackIndex] = updatedFolder;
  }
};

export const {
  setFolderStack,
  pushFolderStack,
  popFolderStack,
  setCurrentNote,
} = itemsSlice.actions;
export default itemsSlice.reducer;

// Hàm chuẩn hóa dữ liệu, đảm bảo mọi file/folder đều có type
function normalizeItems(items: any[]): RootItem[] {
  return items.map(item => {
    if (item.type === 'folder' || (item.subfolders && item.files)) {
      return {
        ...item,
        type: 'folder',
        subfolders: item.subfolders ? normalizeItems(item.subfolders) : [],
        files: item.files
          ? item.files.map((f: any) => ({ ...f, type: 'file' }))
          : [],
      };
    } else {
      return { ...item, type: 'file' };
    }
  });
}
