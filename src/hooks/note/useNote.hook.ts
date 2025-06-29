import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setFolderStack, fetchItems } from '../../store/slices/items.slice';
import SocketService from '../../services/socket.service';

export function useNote() {
  const dispatch = useDispatch<AppDispatch>();
  const { folderStack, items, loading } = useSelector(
    (state: RootState) => state.items
  );
  const pendingStackIdsRef = useRef<string[]>([]);

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
    isSharedView?: boolean;
  }) => {
    if (data.isSharedView) {
      return;
    }

    const stackIds = folderStack.map(folder => folder._id);

    if (stackIds.length > 0) {
      pendingStackIdsRef.current = stackIds;
    }

    dispatch(fetchItems() as any);
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
    dispatch(fetchItems() as any);
  }, [dispatch]);

  useEffect(() => {
    SocketService.connect();

    SocketService.on('folder_structure_changed', handleFolderStructureChanged);

    return () => {
      SocketService.off(
        'folder_structure_changed',
        handleFolderStructureChanged
      );
    };
  }, [dispatch, folderStack]);
}
