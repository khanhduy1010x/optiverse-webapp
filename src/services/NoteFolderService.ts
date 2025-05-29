import { FolderItem, RootItem } from '../types/note.types';
import api from './api';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const NoteFolderService = {
  getAllRootItems: async (): Promise<RootItem[]> => {
    try {
      const response = await api.get<ApiResponse<RootItem[]>>('note-folder/root/retrive-web');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch root items:', error);
      throw new Error('Could not fetch root items');
    }
  },

  getFolderById: async (id: string): Promise<FolderItem> => {
    try {
      const response = await api.get<ApiResponse<FolderItem>>(`note-folder/${id}`);
      return { ...response.data.data, type: 'folder' as const };
    } catch (error) {
      console.error(`Failed to fetch folder with id ${id}:`, error);
      throw new Error(`Could not fetch folder with id ${id}`);
    }
  },

  handleDeleteFolder: async (item: FolderItem): Promise<void> => {
    try {
      await api.delete(`note-folder/${item._id}`);
    } catch (error) {
      console.error(`Failed to delete folder ${item._id}:`, error);
      throw new Error(`Could not delete folder ${item.name}`);
    }
  },

  handleAddFolder: async (parent_folder_id: string | null, name: string): Promise<FolderItem> => {
    try {
      const response = await api.post<ApiResponse<{ noteFolder: FolderItem }>>('note-folder', {
        parent_folder_id,
        name,
      });
      return { ...response.data.data.noteFolder, type: 'folder' as const, files: [], subfolders: [] };
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw new Error(`Could not create folder ${name}`);
    }
  },

  handleRenameFolder: async (name: string, id: string): Promise<void> => {
    try {
      await api.patch(`note-folder/${id}`, { name });
    } catch (error) {
      console.error(`Failed to rename folder ${id}:`, error);
      throw new Error(`Could not rename folder to ${name}`);
    }
  },
};