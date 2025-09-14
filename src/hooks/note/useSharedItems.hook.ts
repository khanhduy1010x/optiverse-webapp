import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RootItem } from '../../types/note/note.types';
import { FolderItem } from '../../types/note/response/folder.response';
import { NoteItem } from '../../types/note/response/note.response';
import ShareService from '../../services/share.service';
import {
  setItems,
  setFolderStack,
  setCurrentNote,
  fetchItems,
} from '../../store/slices/items.slice';
import SocketService from '../../services/socket.service';
import { useNoteManager } from './useNoteManager.hook';

interface ApiResponse {
  data?: RootItem[];
  [key: string]: any;
}

export const useSharedItems = () => {
  const dispatch = useDispatch();
  const [isSharedView, setIsSharedView] = useState(false);
  const [loadingShared, setLoadingShared] = useState(false);
  const { setCurrentViewType } = useNoteManager();

  const normalizeSharedItems = (items: any[]): RootItem[] => {
    return items.map(item => {
      if (item.type === 'folder' || (item.subfolders && item.files)) {
        const folder: FolderItem = {
          ...item,
          type: 'folder',
          subfolders: Array.isArray(item.subfolders)
            ? (normalizeSharedItems(item.subfolders).map((subfolder: any) => ({
                ...subfolder,
                isShared: true,
                sharedBy: item.sharedBy || subfolder.sharedBy,
                permission: item.permission || subfolder.permission,
                owner_info: item.owner_info || subfolder.owner_info,
              })) as FolderItem[])
            : [],
          files: Array.isArray(item.files)
            ? (item.files.map((f: any) => ({
                ...f,
                type: 'file',
                isShared: true,
                sharedBy: item.sharedBy || f.sharedBy,
                permission: item.permission || f.permission,
                owner_info: item.owner_info || f.owner_info,
              })) as NoteItem[])
            : [],
        };
        return folder;
      } else {
        const note: NoteItem = {
          ...item,
          type: 'file',
          isShared: item.isShared !== undefined ? item.isShared : true,
        };
        return note;
      }
    });
  };

  const refreshSharedItems = async () => {
    if (!isSharedView) return;

    setLoadingShared(true);
    try {
      const items = (await ShareService.getSharedWithMe()) as
        | RootItem[]
        | ApiResponse;

      let sharedData: any[] = [];
      if (Array.isArray(items)) {
        sharedData = items;
      } else if (items && 'data' in items && Array.isArray(items.data)) {
        sharedData = items.data;
      }

      const normalizedItems = normalizeSharedItems(sharedData);
      dispatch(setItems(normalizedItems));
    } catch (err) {
      console.error('Error refreshing shared items:', err);
    } finally {
      setLoadingShared(false);
    }
  };

  const handleNoteDeleted = (data: {
    noteId: string;
    eventType?: 'my_note' | 'shared_note';
  }) => {
    if (data?.eventType === 'my_note') {
      return;
    }

    if (!isSharedView) return;

    refreshSharedItems();
    dispatch(setCurrentNote(undefined));
  };

  const handleNoteRenamed = (data: {
    noteId: string;
    newTitle: string;
    eventType?: 'my_note' | 'shared_note';
  }) => {
    if (data?.eventType === 'my_note') {
      return;
    }

    if (!isSharedView) return;

    refreshSharedItems();
  };

  const handleFolderDeleted = (data: {
    folderId: string;
    eventType?: 'my_note' | 'shared_note';
  }) => {
    if (data?.eventType === 'my_note') {
      return;
    }

    if (!isSharedView) return;

    refreshSharedItems();
    dispatch(setFolderStack([]));
  };

  const handleFolderRenamed = (data: {
    folderId: string;
    newName: string;
    eventType?: 'my_note' | 'shared_note';
  }) => {
    if (data?.eventType === 'my_note') {
      return;
    }

    if (!isSharedView) return;

    refreshSharedItems();
  };

  const handleFolderStructureChanged = async (data: {
    eventType?: 'my_note' | 'shared_note';
    isSharedView?: boolean;
    removedFromShare?: boolean;
  }) => {
    if (data?.eventType === 'my_note') {
      return;
    }

    if (data?.removedFromShare === true) {
      await refreshSharedItems();
      return;
    }

    if (
      isSharedView ||
      data?.eventType === 'shared_note' ||
      data?.isSharedView === true
    ) {
      console.log(
        'Getting data from ShareService.getSharedWithMe() based on shared view or event flag'
      );
      await refreshSharedItems();
      return;
    }

    console.log(
      'Skipping folder_structure_changed in useSharedItems hook - not in shared view and no shared_note event'
    );
  };

  const handlePermissionChanged = (data: {
    resourceId: string;
    permission: string;
    shouldRefreshShared?: boolean;
    eventType?: 'my_note' | 'shared_note';
  }) => {
    if (data?.eventType === 'my_note') {
      console.log(
        'Skipping permission_changed in useSharedItems hook because eventType=my_note'
      );
      return;
    }

    if (!isSharedView) return;

    if (data.shouldRefreshShared) {
      console.log(
        `Dòng 78 File useSharedItems.hook.ts - Đã cập nhật data shared notes (permission_changed: ${data.resourceId} -> ${data.permission})`
      );
      refreshSharedItems();
    }
  };

  useEffect(() => {
    if (isSharedView) {
      SocketService.on('note_deleted', handleNoteDeleted);
      SocketService.on('note_renamed', handleNoteRenamed);
      SocketService.on('folder_deleted', handleFolderDeleted);
      SocketService.on('folder_renamed', handleFolderRenamed);
      SocketService.on(
        'folder_structure_changed',
        handleFolderStructureChanged
      );
      SocketService.on('permission_changed', handlePermissionChanged);

      SocketService.setViewingSharedItems(true);

      return () => {
        SocketService.off('note_deleted', handleNoteDeleted);
        SocketService.off('note_renamed', handleNoteRenamed);
        SocketService.off('folder_deleted', handleFolderDeleted);
        SocketService.off('folder_renamed', handleFolderRenamed);
        SocketService.off(
          'folder_structure_changed',
          handleFolderStructureChanged
        );
        SocketService.off('permission_changed', handlePermissionChanged);

        SocketService.setViewingSharedItems(false);
      };
    }
  }, [isSharedView, dispatch]);

  const handleToggleSharedView = async () => {
    setLoadingShared(true);
    try {
      const newIsSharedView = !isSharedView;
      setIsSharedView(newIsSharedView);

      setCurrentViewType(newIsSharedView ? 'shared_note' : 'my_note');

      SocketService.setViewingSharedItems(newIsSharedView);

      if (newIsSharedView) {
        const items = (await ShareService.getSharedWithMe()) as
          | RootItem[]
          | ApiResponse;

        let sharedData: any[] = [];
        if (Array.isArray(items)) {
          sharedData = items;
        } else if (items && 'data' in items && Array.isArray(items.data)) {
          sharedData = items.data;
        }

        const normalizedItems = normalizeSharedItems(sharedData);

        console.log(
          `Dòng 115 File useSharedItems.hook.ts - Đã cập nhật data shared notes (toggle to shared view)`
        );
        dispatch(setItems(normalizedItems));
        dispatch(setFolderStack([]));
      } else {
        console.log(
          `Dòng 120 File useSharedItems.hook.ts - Đã cập nhật data my notes (toggle to my view)`
        );
        dispatch(fetchItems() as any);
        dispatch(setFolderStack([]));
      }
    } catch (err) {
      console.error('Error fetching shared items:', err);
    } finally {
      setLoadingShared(false);
    }
  };

  return {
    isSharedView,
    loadingShared,
    handleToggleSharedView,
    refreshSharedItems,
  };
};
