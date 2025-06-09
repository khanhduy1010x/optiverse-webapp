import { ApiResponse } from '../types/api/api.interface';
import { RootItem } from '../types/note/note.types';
import { FolderItem } from '../types/note/response/folder.response';
import api from './api.service';

class NoteFolderService {
  async getAllRootItems(): Promise<RootItem[]> {
    try {
      const response = await api.get<ApiResponse<RootItem[]>>(
        'productivity/note-folder/root/retrive-web'
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch root items:', error);
      throw new Error('Could not fetch root items');
    }
  }

  async getFolderById(id: string): Promise<FolderItem> {
    try {
      const response = await api.get<ApiResponse<FolderItem>>(
        `productivity/note-folder/${id}`
      );
      return { ...response.data.data, type: 'folder' as const };
    } catch (error) {
      console.error(`Failed to fetch folder with id ${id}:`, error);
      throw new Error(`Could not fetch folder with id ${id}`);
    }
  }

  async handleDeleteFolder(item: FolderItem): Promise<void> {
    try {
      await api.delete(`productivity/note-folder/${item._id}`);
    } catch (error) {
      console.error(`Failed to delete folder ${item._id}:`, error);
      throw new Error(`Could not delete folder ${item.name}`);
    }
  }

  async handleAddFolder(
    parent_folder_id: string | null,
    name: string
  ): Promise<FolderItem> {
    try {
      const response = await api.post<ApiResponse<{ noteFolder: FolderItem }>>(
        'productivity/note-folder',
        {
          parent_folder_id,
          name,
        }
      );
      return {
        ...response.data.data.noteFolder,
        type: 'folder' as const,
        files: [],
        subfolders: [],
      };
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw new Error(`Could not create folder ${name}`);
    }
  }

  async handleRenameFolder(name: string, id: string): Promise<void> {
    try {
      await api.patch(`productivity/note-folder/${id}`, { name });
    } catch (error) {
      console.error(`Failed to rename folder ${id}:`, error);
      throw new Error(`Could not rename folder to ${name}`);
    }
  }
};

export default new NoteFolderService()