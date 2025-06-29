import { ApiResponse } from '../types/api/api.interface';
import { RootItem } from '../types/note/note.types';
import { FolderItem } from '../types/note/response/folder.response';
import api from './api.service';
import SocketService from './socket.service';

const URLBASE = 'productivity/note-folder';

class NoteFolderService {
  async getAllRootItems(): Promise<RootItem[]> {
    try {
      const response = await api.get<ApiResponse<RootItem[]>>(
        `${URLBASE}/root/retrive-web`
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
        `${URLBASE}/${id}`
      );
      return { ...response.data.data, type: 'folder' as const };
    } catch (error) {
      console.error(`Failed to fetch folder with id ${id}:`, error);
      throw new Error(`Could not fetch folder with id ${id}`);
    }
  }

  async handleDeleteFolder(item: FolderItem): Promise<void> {
    try {
      await api.delete(`${URLBASE}/${item._id}`);

      // Phát ra sự kiện thông báo folder đã bị xóa
      SocketService.emitFolderDeleted(item._id);

      // Phát ra sự kiện thông báo cấu trúc thư mục đã thay đổi
      SocketService.emitFolderStructureChanged();
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
        `${URLBASE}`,
        {
          parent_folder_id,
          name,
        }
      );

      // Phát ra sự kiện thông báo cấu trúc thư mục đã thay đổi
      SocketService.emitFolderStructureChanged();

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

  async handleRenameFolder(name: string, folderId: string): Promise<void> {
    try {
      await api.patch(`${URLBASE}/${folderId}`, {
        name,
      });

      SocketService.emitFolderRenamed(folderId, name);
    } catch (error: any) {
      console.error(`Failed to rename folder ${folderId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not rename folder to ${name}`);
    }
  }
}

export default new NoteFolderService();
