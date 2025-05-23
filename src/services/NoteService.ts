import { NoteItem } from '../types/note.types';
import api from './api';

const URLBASE = 'note';

export const NoteService = {
  getRootNote: async (): Promise<NoteItem[]> => {
    try {
      const response = await api.get<{ data: NoteItem[] }>(`${URLBASE}/root`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch root notes:', error);
      throw new Error('Could not fetch root notes');
    }
  },

  getNoteByFolderId: async (parent_folder_id: string): Promise<NoteItem[]> => {
    try {
      const response = await api.get<{ data: NoteItem[] }>(`note/folder/${parent_folder_id}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Failed to fetch notes for folder ${parent_folder_id}:`, error);
      throw new Error(`Could not fetch notes for folder ${parent_folder_id}`);
    }
  },

  saveNote: async (note: NoteItem): Promise<NoteItem> => {
    try {
      const response = await api.patch<{ data: NoteItem }>(`/note/${note._id}`, {
        content: note.content,
      });
      return response.data.data;
    } catch (error) {
      console.error(`Failed to save note ${note._id}:`, error);
      throw new Error(`Could not save note ${note.title}`);
    }
  },

  handleDeleteNote: async (note: NoteItem): Promise<void> => {
    try {
      await api.delete(`${URLBASE}/${note._id}`);
    } catch (error) {
      console.error(`Failed to delete note ${note._id}:`, error);
      throw new Error(`Could not delete note ${note.title}`);
    }
  },

  handleCreateNote: async (folder_id: string | null, title: string): Promise<NoteItem> => {
    try {
      const response = await api.post<{ data: { note: NoteItem } }>(`${URLBASE}`, {
        folder_id,
        title,
        content: '',
      });
      return response.data.data.note;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw new Error(`Could not create note ${title}`);
    }
  },

  handleRenameNote: async (title: string, item: NoteItem): Promise<void> => {
    try {
      await api.patch(`/note/${item._id}`, {
        title,
        content: item.content,
      });
    } catch (error) {
      console.error(`Failed to rename note ${item._id}:`, error);
      throw new Error(`Could not rename note to ${title}`);
    }
  },
};