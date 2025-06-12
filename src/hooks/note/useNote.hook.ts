import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { RootState, AppDispatch } from '../../store';
import { saveNote, setFolderStack } from '../../store/slices/items.slice';
import SocketService from '../../services/socket.service';
import { toast } from 'react-toastify';
import { fetchItems } from '../../store/slices/items.slice';
import noteFolderService from '../../services/noteFolder.service';

export function useNote() {
  const dispatch = useDispatch<AppDispatch>();
  const { folderStack, items, loading } = useSelector(
    (state: RootState) => state.items
  );
  const pendingStackIdsRef = useRef<string[]>([]);

  function normalizeItems(items: any[]): any[] {
    return items.map(item => {
      if (item.type === 'folder' || (item.subfolders && item.files)) {
        return {
          ...item,
          type: 'folder',
          subfolders: item.subfolders ? normalizeItems(item.subfolders) : [],
          files: item.files
            ? item.files.map((f: any) => ({ ...f, type: 'file' }))
            : [],
        };
      } else {
        return { ...item, type: 'file' };
      }
    });
  }

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

  const handleFolderStructureChanged = async () => {
    console.log('Folder structure was changed, fetching updated items');

    const stackIds = folderStack.map(folder => folder._id);

    if (stackIds.length > 0) {
      pendingStackIdsRef.current = stackIds;
    }

    dispatch(fetchItems());

    toast.info('Folder structure has been updated');
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

    return () => {
      SocketService.off(
        'folder_structure_changed',
        handleFolderStructureChanged
      );
    };
  }, [dispatch, folderStack]);
}
