import { ApiResponse } from '../types/api/api.interface';
import api from './api.service';
import { RootItem } from '../types/note/note.types';

const URLBASE = 'productivity';

interface WorkspaceFolder {
  _id: string;
  name: string;
  workspace_id: string;
  parent_folder_id?: string | null;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceNote {
  _id: string;
  title: string;
  content: string;
  workspace_id: string;
  folder_id?: string | null;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

class WorkspaceNoteService {
  /**
   * Get all folders in workspace
   */
  async getWorkspaceFolders(workspaceId: string): Promise<WorkspaceFolder[]> {
    try {
      const response = await api.get<ApiResponse<WorkspaceFolder[]>>(
        `${URLBASE}/workspace/${workspaceId}/folders`
      );
      const data = response.data.data;
      // Handle both array and paginated responses
      if (Array.isArray(data)) {
        return data || [];
      }
      if (data && typeof data === 'object' && 'data' in data) {
        return Array.isArray(data.data) ? data.data : [];
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch workspace folders:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not fetch workspace folders');
    }
  }

  /**
   * Get all notes in workspace
   */
  async getWorkspaceNotes(workspaceId: string): Promise<WorkspaceNote[]> {
    try {
      const response = await api.get<ApiResponse<WorkspaceNote[]>>(
        `${URLBASE}/workspace/${workspaceId}/notes`
      );
      const data = response.data.data;
      // Handle both array and paginated responses
      if (Array.isArray(data)) {
        return data || [];
      }
      if (data && typeof data === 'object' && 'data' in data) {
        return Array.isArray(data.data) ? data.data : [];
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch workspace notes:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error('Could not fetch workspace notes');
    }
  }

  /**
   * Build folder tree from folders and notes
   * Combines folders and notes into a tree structure
   */
  buildFolderTree(
    folders: WorkspaceFolder[],
    notes: WorkspaceNote[]
  ): RootItem[] {
    // Safety check: ensure folders and notes are arrays
    const foldersArray = Array.isArray(folders) ? folders : [];
    const notesArray = Array.isArray(notes) ? notes : [];

    // Create a map for easy lookup
    const folderMap = new Map<string, RootItem>();

    // Initialize folders as RootItems
    foldersArray.forEach(folder => {
      folderMap.set(folder._id, {
        _id: folder._id,
        name: folder.name,
        type: 'folder',
        updatedAt: folder.updatedAt,
        subfolders: [],
        files: [],
      });
    });

    // Add root notes (notes without folder_id)
    const rootNotes = notesArray
      .filter(note => !note.folder_id)
      .map(note => ({
        _id: note._id,
        title: note.title,
        type: 'file' as const,
        updatedAt: note.updatedAt,
      }));

    // Build tree structure
    const rootItems: RootItem[] = [];

    folderMap.forEach((folder, folderId) => {
      const parentId = foldersArray.find(
        f => f._id === folderId
      )?.parent_folder_id;

      if (!parentId) {
        // Root folder
        rootItems.push(folder);
      } else if (folderMap.has(parentId)) {
        // Add to parent folder's subfolders
        const parent = folderMap.get(parentId)!;
        parent.subfolders?.push(folder);
      }
    });

    // Add notes to their respective folders or root
    notesArray.forEach(note => {
      const noteItem: RootItem = {
        _id: note._id,
        title: note.title,
        type: 'file',
        updatedAt: note.updatedAt,
      };

      if (note.folder_id && folderMap.has(note.folder_id)) {
        // Add to folder's files
        const folder = folderMap.get(note.folder_id)!;
        folder.files?.push(noteItem);
      } else {
        // Add to root
        rootItems.push(noteItem);
      }
    });

    return rootItems;
  }

  /**
   * Get complete workspace note tree
   */
  async getWorkspaceNoteTree(workspaceId: string): Promise<RootItem[]> {
    try {
      // Fetch both folders and notes in parallel
      const [folders, notes] = await Promise.all([
        this.getWorkspaceFolders(workspaceId),
        this.getWorkspaceNotes(workspaceId),
      ]);

      // Build and return tree
      return this.buildFolderTree(folders, notes);
    } catch (error: any) {
      console.error('Failed to get workspace note tree:', {
        error: error.message,
      });
      throw new Error('Could not fetch workspace note tree');
    }
  }

  /**
   * Create a new folder in workspace
   */
  async createFolder(
    workspaceId: string,
    name: string,
    parentFolderId?: string | null
  ): Promise<WorkspaceFolder> {
    try {
      const response = await api.post<ApiResponse<WorkspaceFolder>>(
        `${URLBASE}/workspace/${workspaceId}/folders`,
        {
          name,
          parent_folder_id: parentFolderId || null,
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create folder:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not create folder: ${error.message}`);
    }
  }

  /**
   * Create a new note in workspace
   */
  async createNote(
    workspaceId: string,
    title: string,
    folderId?: string | null
  ): Promise<WorkspaceNote> {
    try {
      const response = await api.post<ApiResponse<WorkspaceNote>>(
        `${URLBASE}/workspace/${workspaceId}/notes`,
        {
          title,
          folder_id: folderId || null,
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create note:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not create note: ${error.message}`);
    }
  }

  /**
   * Delete a folder in workspace
   */
  async deleteFolder(workspaceId: string, folderId: string): Promise<void> {
    try {
      await api.delete(
        `${URLBASE}/workspace/${workspaceId}/folders/${folderId}`
      );
    } catch (error: any) {
      console.error('Failed to delete folder:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not delete folder: ${error.message}`);
    }
  }

  /**
   * Delete a note in workspace
   */
  async deleteNote(workspaceId: string, noteId: string): Promise<void> {
    try {
      await api.delete(`${URLBASE}/workspace/${workspaceId}/notes/${noteId}`);
    } catch (error: any) {
      console.error('Failed to delete note:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not delete note: ${error.message}`);
    }
  }

  /**
   * Rename a folder in workspace
   */
  async renameFolder(
    workspaceId: string,
    folderId: string,
    name: string
  ): Promise<void> {
    try {
      await api.put(`${URLBASE}/workspace/${workspaceId}/folders/${folderId}`, {
        name,
      });
    } catch (error: any) {
      console.error('Failed to rename folder:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not rename folder: ${error.message}`);
    }
  }

  /**
   * Rename a note in workspace
   */
  async renameNote(
    workspaceId: string,
    noteId: string,
    title: string
  ): Promise<void> {
    try {
      await api.put(`${URLBASE}/workspace/${workspaceId}/notes/${noteId}`, {
        title,
      });
    } catch (error: any) {
      console.error('Failed to rename note:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not rename note: ${error.message}`);
    }
  }

  /**
   * Get note detail with content
   */
  async getNoteDetail(
    workspaceId: string,
    noteId: string
  ): Promise<WorkspaceNote> {
    try {
      const response = await api.get<ApiResponse<WorkspaceNote>>(
        `${URLBASE}/workspace/${workspaceId}/notes/${noteId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch note detail:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not fetch note detail: ${error.message}`);
    }
  }
}

export default new WorkspaceNoteService();
