import { NoteItem, RootItem } from '../types/note.types';
import api from './api';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const URLBASE = 'note';

export const NoteService = {
  saveNote: async (note: NoteItem): Promise<NoteItem> => {
    try {
      const response = await api.patch<ApiResponse<{ note: NoteItem }>>(`/note/${note._id}`, {
        content: note.content,
        title: note.title,
        folder_id: note.folder_id,
      });
      const savedNote = { ...response.data.data.note, type: 'file' as const };
      return savedNote;
    } catch (error: any) {
      console.error(`Failed to save note ${note._id} (folder_id: ${note.folder_id}):`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not save note ${note.title}`);
    }
  },

  handleDeleteNote: async (note: NoteItem): Promise<void> => {
    try {
      await api.delete(`${URLBASE}/${note._id}`);
    } catch (error: any) {
      console.error(`Failed to delete note ${note._id} (folder_id: ${note.folder_id}):`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not delete note ${note.title}`);
    }
  },

  handleCreateNote: async (folder_id: string | null, title: string): Promise<NoteItem> => {
    try {
      const response = await api.post<ApiResponse<{ note: NoteItem }>>(`${URLBASE}`, {
        folder_id,
        title,
        content: '',
      });
      return { ...response.data.data.note, type: 'file' as const };
    } catch (error: any) {
      console.error('Failed to create note:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not create note ${title}`);
    }
  },

  handleRenameNote: async (title: string, item: NoteItem): Promise<void> => {
    try {
      await api.patch(`/note/${item._id}`, {
        title,
        content: item.content,
        folder_id: item.folder_id,
      });
    } catch (error: any) {
      console.error(`Failed to rename note ${item._id} (folder_id: ${item.folder_id}):`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not rename note to ${title}`);
    }
  },
};