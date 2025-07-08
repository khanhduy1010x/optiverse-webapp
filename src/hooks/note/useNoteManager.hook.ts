import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setFolderStack, fetchItems } from '../../store/slices/items.slice';
import SocketService from '../../services/socket.service';

export function useNoteManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { folderStack, items, loading } = useSelector(
    (state: RootState) => state.items
  );
  const pendingStackIdsRef = useRef<string[]>([]);
  const currentViewTypeRef = useRef<'my_note' | 'shared_note'>('my_note');

  const syncFolderItemAfterFetch = (
    newItems: any[],
    stackIds: string[]
  ): any[] => {
    const updatedStack: any[] = [];
    let currentLevel = newItems;

    for (const id of stackIds) {
      const updatedFolder = currentLevel.find(
        item => item._id === id && item.type === 'folder'
      );

      if (!updatedFolder) {
        console.warn(`Cannot find folder with ID ${id} when syncing`);
        break;
      }
      updatedStack.push(updatedFolder);
      currentLevel = updatedFolder.subfolders ?? [];
    }

    return updatedStack;
  };

  const handleFolderStructureChanged = async (data: {
    eventType?: 'my_note' | 'shared_note';
    isSharedView?: boolean;
    removedFromShare?: boolean;
  }) => {
    const eventType =
      data?.eventType || (data?.isSharedView ? 'shared_note' : 'my_note');

    if (eventType !== currentViewTypeRef.current) {
      return;
    }

    if (data?.removedFromShare === true && eventType === 'shared_note') {
      return;
    }

    const stackIds = folderStack.map(folder => folder._id);

    if (stackIds.length > 0) {
      pendingStackIdsRef.current = stackIds;
    }

    if (eventType === 'my_note') {
      dispatch(fetchItems() as any);
    }
  };

  const handleNoteDeleted = (data: {
    noteId: string;
    eventType?: 'my_note' | 'shared_note';
  }) => {
    const eventType = data?.eventType || 'my_note';

    if (eventType !== currentViewTypeRef.current) {
      return;
    }

    handleFolderStructureChanged({ eventType });
  };

  const handleNoteRenamed = (data: {
    noteId: string;
    newTitle: string;
    eventType?: 'my_note' | 'shared_note';
  }) => {
    const eventType = data?.eventType || 'my_note';

    if (eventType !== currentViewTypeRef.current) {
      return;
    }

    handleFolderStructureChanged({ eventType });
  };

  const handleFolderDeleted = (data: {
    folderId: string;
    eventType?: 'my_note' | 'shared_note';
  }) => {
    const eventType = data?.eventType || 'my_note';

    if (eventType !== currentViewTypeRef.current) {
      return;
    }

    handleFolderStructureChanged({ eventType });
  };

  const handleFolderRenamed = (data: {
    folderId: string;
    newName: string;
    eventType?: 'my_note' | 'shared_note';
  }) => {
    const eventType = data?.eventType || 'my_note';

    if (eventType !== currentViewTypeRef.current) {
      return;
    }

    handleFolderStructureChanged({ eventType });
  };

  const setCurrentViewType = (viewType: 'my_note' | 'shared_note') => {
    currentViewTypeRef.current = viewType;
  };

  useEffect(() => {
    if (!loading && pendingStackIdsRef.current.length > 0) {
      const stackIds = pendingStackIdsRef.current;
      const updatedStack = syncFolderItemAfterFetch(items, stackIds);

      if (updatedStack.length > 0) {
        dispatch(setFolderStack(updatedStack));
      }

      pendingStackIdsRef.current = [];
    }
  }, [items, loading, dispatch]);

  useEffect(() => {
    SocketService.connect();

    SocketService.on('folder_structure_changed', handleFolderStructureChanged);
    SocketService.on('note_deleted', handleNoteDeleted);
    SocketService.on('note_renamed', handleNoteRenamed);
    SocketService.on('folder_deleted', handleFolderDeleted);
    SocketService.on('folder_renamed', handleFolderRenamed);

    return () => {
      SocketService.off(
        'folder_structure_changed',
        handleFolderStructureChanged
      );
      SocketService.off('note_deleted', handleNoteDeleted);
      SocketService.off('note_renamed', handleNoteRenamed);
      SocketService.off('folder_deleted', handleFolderDeleted);
      SocketService.off('folder_renamed', handleFolderRenamed);
    };
  }, [dispatch, folderStack]);

  return {
    setCurrentViewType,
    currentViewType: currentViewTypeRef.current,
  };
}
