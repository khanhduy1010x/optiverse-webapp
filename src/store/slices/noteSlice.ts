import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NoteItem } from '../../types/note.types';
import { NoteService } from '../../services/NoteService';

interface NoteState {
  notes: NoteItem[];
  currentNote?: NoteItem;
  loading: boolean;
  error: string | null;
}

const initialState: NoteState = {
  notes: [],
  currentNote: undefined,
  loading: false,
  error: null,
};

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async () => {
  return await NoteService.getRootNote();
});

export const saveNote = createAsyncThunk('notes/saveNote', async (note: NoteItem) => {
  return await NoteService.saveNote(note);
});

export const createNote = createAsyncThunk(
  'notes/createNote',
  async ({ parentId, title }: { parentId: string | null; title: string }) => {
    return await NoteService.handleCreateNote(parentId, title);
  }
);

export const deleteNote = createAsyncThunk('notes/deleteNote', async (note: NoteItem) => {
  await NoteService.handleDeleteNote(note);
  return note._id;
});

export const renameNote = createAsyncThunk(
  'notes/renameNote',
  async ({ title, note }: { title: string; note: NoteItem }) => {
    await NoteService.handleRenameNote(title, note);
    return { _id: note._id, title };
  }
);

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setCurrentNote: (state, action) => {
      state.currentNote = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch notes';
      })
      .addCase(saveNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveNote.fulfilled, (state, action) => {
        state.currentNote = action.payload;
        const index = state.notes.findIndex((note) => note._id === action.payload._id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(saveNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save note';
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.push(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create note';
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((note) => note._id !== action.payload);
        if (state.currentNote?._id === action.payload) {
          state.currentNote = undefined;
        }
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete note';
      })
      .addCase(renameNote.fulfilled, (state, action) => {
        const { _id, title } = action.payload;
        const index = state.notes.findIndex((note) => note._id === _id);
        if (index !== -1) {
          state.notes[index].title = title;
        }
        if (state.currentNote?._id === _id) {
          state.currentNote = { ...state.currentNote, title };
        }
      })
      .addCase(renameNote.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to rename note';
      });
  },
});

export const { setCurrentNote } = noteSlice.actions;
export default noteSlice.reducer;