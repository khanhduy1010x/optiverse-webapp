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

export type WorkspaceNoteDetail = WorkspaceNote & {
  permission?: 'view' | 'edit';
};

class WorkspaceNoteService {
  /**
   * Extract meaningful error message from API error response
   */
  // Helper method to extract error message from API response
  extractErrorMessage(
    error: any,
    defaultMessage: string = 'An error occurred'
  ): string {
    // Try to get error message from various possible locations
    let message = '';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.message) {
      message = error.message;
    } else {
      message = defaultMessage;
    }

    // Improve some common error messages for better UX
    return this.improveErrorMessage(message);
  }

  /**
   * Improve error messages to be more user-friendly
   */
  improveErrorMessage(message: string): string {
    // Common error patterns and their improvements
    const errorMappings: { [key: string]: string } = {
      ValidationError: 'Please check your input and try again',
      Unauthorized: 'You do not have permission to perform this action',
      Forbidden: 'Access denied. Please check your permissions',
      'Network Error':
        'Connection error. Please check your internet connection',
      timeout: 'Request timed out. Please try again',
    };

    // Check for exact matches first
    if (errorMappings[message]) {
      return errorMappings[message];
    }

    // Check for partial matches and improve specific validation errors
    if (message.includes('already exists in this location')) {
      return message; // Keep validation errors as is - they're already user-friendly
    }

    if (message.includes('cannot contain the following characters')) {
      return message; // Keep validation errors as is
    }

    if (message.includes('must be 30 characters or less')) {
      return message; // Keep validation errors as is
    }

    if (message.includes('cannot be a reserved Windows name')) {
      return message; // Keep validation errors as is
    }

    if (message.includes('cannot start or end with a space or dot')) {
      return message; // Keep validation errors as is
    }

    // For other messages, return as is
    return message;
  }
  /**
   * Check NOTE permission (NOTE_ADMIN) for current user in workspace
   */
  async getNoteAdminPermission(
    workspaceId: string
  ): Promise<{ isNoteAdmin: boolean }> {
    try {
      const response = await api.get<ApiResponse<{ isNoteAdmin: boolean }>>(
        `${URLBASE}/workspace/${workspaceId}/notes/permission`
      );
      return response.data.data || { isNoteAdmin: false };
    } catch (error: any) {
      console.error('Failed to fetch note permission:', {
        error: error.message,
        response: error.response?.data,
      });
      return { isNoteAdmin: false };
    }
  }
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

      // Extract detailed error message from backend
      const errorMessage = this.extractErrorMessage(
        error,
        'Could not create folder'
      );
      throw new Error(errorMessage);
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

      // Extract detailed error message from backend
      const errorMessage = this.extractErrorMessage(
        error,
        'Could not create note'
      );
      throw new Error(errorMessage);
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

      // If note not found, it might have been deleted by another user
      const responseMessage = error.response?.data?.message || '';
      if (responseMessage.includes('Note not found')) {
        throw new Error('Note not found in this workspace');
      }

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

      // Extract detailed error message from backend
      const errorMessage = this.extractErrorMessage(
        error,
        'Could not rename folder'
      );
      throw new Error(errorMessage);
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

      // Extract detailed error message from backend
      const errorMessage = this.extractErrorMessage(
        error,
        'Could not rename note'
      );
      throw new Error(errorMessage);
    }
  }

  /**
   * Get note detail with content
   */
  async getNoteDetail(
    workspaceId: string,
    noteId: string
  ): Promise<WorkspaceNoteDetail> {
    try {
      const response = await api.get<ApiResponse<WorkspaceNoteDetail>>(
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
