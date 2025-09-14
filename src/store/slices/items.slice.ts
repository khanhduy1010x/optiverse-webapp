import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import noteFolderService from '../../services/noteFolder.service';
import noteService from '../../services/note.service';
import { ItemsState, RootItem } from '../../types/note/note.types';
import { FolderItem } from '../../types/note/response/folder.response';
import { NoteItem } from '../../types/note/response/note.response';

const initialState: ItemsState = {
  items: [],
  folderStack: [],
  currentNote: undefined,
  loading: false,
  error: null,
  currentViewType: 'my_note',
};

export const fetchItems = createAsyncThunk('items/fetchItems', async () => {
  return await noteFolderService.getAllRootItems();
});

export const fetchSharedItems = createAsyncThunk(
  'items/fetchSharedItems',
  async () => {
    const ShareService = (await import('../../services/share.service')).default;
    return await ShareService.getSharedWithMe();
  }
);

export const createFolder = createAsyncThunk(
  'items/createFolder',
  async ({ parentId, name }: { parentId: string | null; name: string }) => {
    const folder = await noteFolderService.handleAddFolder(parentId, name);
    return { folder, parentId };
  }
);

export const createNote = createAsyncThunk(
  'items/createNote',
  async ({ parentId, title }: { parentId: string | null; title: string }) => {
    const note = await noteService.handleCreateNote(parentId, title);
    return { note, parentId };
  }
);

export const deleteItem = createAsyncThunk(
  'items/deleteItem',
  async (item: RootItem) => {
    if (item.type === 'folder') {
      await noteFolderService.handleDeleteFolder(item);
    } else {
      await noteService.handleDeleteNote(item);
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
      await noteFolderService.handleRenameFolder(name, item._id);
    } else {
      await noteService.handleRenameNote(name, item);
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
    const response = await noteService.saveNote(note);
    return { response, shouldSetCurrent };
  }
);

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    setItems: (state, action) => {
      console.log(
        `Dòng 85 File items.slice.ts - Đã cập nhật data note (setItems)`
      );
      state.items = action.payload;
    },
    setFolderStack: (state, action) => {
      console.log(
        `Dòng 89 File items.slice.ts - Đã cập nhật folder stack (setFolderStack)`
      );
      state.folderStack = action.payload;
    },
    pushFolderStack: (state, action) => {
      if (action.payload.type === 'folder') {
        console.log(
          `Dòng 93 File items.slice.ts - Đã thêm folder vào stack (pushFolderStack: ${action.payload._id})`
        );
        state.folderStack.push(action.payload);
      }
    },
    popFolderStack: state => {
      console.log(
        `Dòng 98 File items.slice.ts - Đã xóa folder khỏi stack (popFolderStack)`
      );
      state.folderStack.pop();
    },
    setCurrentNote: (state, action) => {
      console.log(
        `Dòng 102 File items.slice.ts - Đã cập nhật current note (setCurrentNote: ${action.payload?._id || 'undefined'})`
      );
      state.currentNote = action.payload;
    },
    updateCurrentNoteContent: (state, action) => {
      if (state.currentNote) {
        console.log(
          `Dòng 106 File items.slice.ts - Đã cập nhật content của current note (updateCurrentNoteContent: ${state.currentNote._id})`
        );
        state.currentNote.content = action.payload;
      }
    },
    setCurrentViewType: (state, action) => {
      console.log(
        `Dòng 111 File items.slice.ts - Đã cập nhật view type (setCurrentViewType: ${action.payload})`
      );
      state.currentViewType = action.payload;
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
        state.currentViewType = 'my_note';
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch items';
      })
      .addCase(fetchSharedItems.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSharedItems.fulfilled, (state, action) => {
     
        state.items = normalizeSharedItems(action.payload);
        state.loading = false;
        state.currentViewType = 'shared_note';
      })
      .addCase(fetchSharedItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shared items';
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
        console.log(
          `Dòng 157 File items.slice.ts - Đã cập nhật data note (createNote: ${note._id})`
        );
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
        console.log(
          `Dòng 215 File items.slice.ts - Đã cập nhật data note (saveNote: ${response._id})`
        );
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
    console.log(
      `Dòng 271 File items.slice.ts - Đã cập nhật note trong root items (updateNoteInState: ${note._id})`
    );
    state.items[index] = note;
    return;
  }
  if (note.folder_id) {
    const parent = findFolderByFolderId(state.items, note.folder_id);
    if (parent) {
      const fileIndex = parent.files.findIndex(file => file._id === note._id);
      if (fileIndex !== -1) {
        console.log(
          `Dòng 279 File items.slice.ts - Đã cập nhật note trong folder (updateNoteInState: ${note._id} trong folder ${parent._id})`
        );
        parent.files[fileIndex] = note;
        updateFolderStack(state, parent._id, parent);
        return;
      }
      console.log(
        `Dòng 284 File items.slice.ts - Đã thêm note mới vào folder (updateNoteInState: ${note._id} vào folder ${parent._id})`
      );
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
    console.log(
      `Dòng 297 File items.slice.ts - Đã cập nhật folder trong stack (updateFolderStack: ${folderId})`
    );
    state.folderStack[stackIndex] = updatedFolder;
  }
};

export const {
  setItems,
  setFolderStack,
  pushFolderStack,
  popFolderStack,
  setCurrentNote,
  updateCurrentNoteContent,
  setCurrentViewType,
} = itemsSlice.actions;
export default itemsSlice.reducer;

function normalizeItems(items: any[]): RootItem[] {
  return items.map(item => {
    if (item.type === 'folder' || (item.subfolders && item.files)) {
      const folder = {
        ...item,
        type: 'folder',
        subfolders: item.subfolders ? normalizeItems(item.subfolders) : [],
        files: item.files
          ? item.files.map((f: any) => ({
              ...f,
              type: 'file',
              isShared: f.isShared !== undefined ? f.isShared : item.isShared,
              sharedBy: f.sharedBy || item.sharedBy,
              permission: f.permission || item.permission,
              owner_info: f.owner_info || item.owner_info,
            }))
          : [],
      };
      return folder;
    } else {
      return {
        ...item,
        type: 'file',
      };
    }
  });
}

function normalizeSharedItems(items: any[]): RootItem[] {
  return items.map(item => {
    if (item.type === 'folder' || (item.subfolders && item.files)) {
      const folder = {
        ...item,
        type: 'folder',
        isShared: true,
        subfolders: item.subfolders
          ? normalizeSharedItems(item.subfolders)
          : [],
        files: item.files
          ? item.files.map((f: any) => ({
              ...f,
              type: 'file',
              isShared: true,
              sharedBy: f.sharedBy || item.sharedBy,
              permission: f.permission || item.permission,
              owner_info: f.owner_info || item.owner_info,
            }))
          : [],
      };
      return folder;
    } else {
      return {
        ...item,
        type: 'file',
        isShared: true,
      };
    }
  });
}
