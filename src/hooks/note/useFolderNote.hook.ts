import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchItems,
  createFolder,
  createNote,
  pushFolderStack,
  popFolderStack,
  deleteItem,
  renameItem,
  setFolderStack,
  setCurrentNote,
} from '../../store/slices/items.slice';
import {
  setFilterType,
  setSelectedItem,
  setShowWarningModal,
} from '../../store/slices/ui.slice';
import { FilterType, RootItem } from '../../types/note/note.types';
import { NoteItem } from '../../types/note/response/note.response';
import { FolderItem } from '../../types/note/response/folder.response';
import { toast } from 'react-toastify';
import SocketService from '../../services/socket.service';

export const useFolderNote = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, folderStack, loading, error, currentNote } = useSelector(
    (state: RootState) => state.items
  );

  const { filterType, selectedItem, isAiFormatting } = useSelector(
    (state: RootState) => state.ui
  );
  const [isModalInputName, setIsModalInputName] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [renameErrorMessage, setRenameErrorMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: RootItem | null;
  } | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [createType, setCreateType] = useState<'folder' | 'note'>('folder');
  const [pendingSync, setPendingSync] = useState<string[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState('');

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  // Xử lý khi folder hiện tại bị xóa
  const handleFolderDeleted = (data: any) => {
    // Kiểm tra xem có đang ở trong folder bị xóa không
    const currentFolder =
      folderStack.length > 0 ? folderStack[folderStack.length - 1] : null;

    // Trường hợp 1: Thư mục hiện tại bị xóa
    if (currentFolder && currentFolder._id === data.folderId) {
      console.log('Current folder was deleted by another user');

      // Chuyển hướng về thư mục cha
      if (folderStack.length > 1) {
        // Nếu có thư mục cha, trở về thư mục cha (bỏ thư mục hiện tại khỏi stack)
        const parentStack = folderStack.slice(0, -1);
        dispatch(setFolderStack(parentStack));
        toast.warning(
          'This folder has been deleted by another user. Redirecting to parent folder.'
        );
      } else {
        // Nếu đang ở thư mục gốc bị xóa, trở về root
        dispatch(setFolderStack([]));
        toast.warning(
          'This folder has been deleted by another user. Redirecting to root.'
        );
      }
      return;
    }

    // Trường hợp 2: Một thư mục cha trong đường dẫn hiện tại bị xóa
    const folderIndex = folderStack.findIndex(
      folder => folder._id === data.folderId
    );
    if (folderIndex !== -1) {
      console.log('A parent folder in the current path was deleted');

      // Trở về thư mục cha của thư mục bị xóa
      const newStack = folderStack.slice(0, folderIndex);
      dispatch(setFolderStack(newStack));
      toast.warning(
        'A parent folder has been deleted by another user. Redirecting to available parent folder.'
      );
    }
  };

  useEffect(() => {
    // Đăng ký lắng nghe sự kiện folder_deleted
    SocketService.on('folder_deleted', handleFolderDeleted);

    return () => {
      // Hủy đăng ký khi component unmount
      SocketService.off('folder_deleted', handleFolderDeleted);
    };
  }, [folderStack, dispatch]);

  const currentItems = useMemo(() => {
    if (folderStack.length > 0) {
      const currentFolder = folderStack[folderStack.length - 1];
      const subfolders = (currentFolder.subfolders || []).map(
        (item: FolderItem) => ({
          ...item,
          type: 'folder' as const,
        })
      );
      const files = (currentFolder.files || []).map((item: NoteItem) => ({
        ...item,
        type: 'file' as const,
      }));

      return [...subfolders, ...files];
    }
    return items;
  }, [folderStack, items]);

  const flattenItems = (items: RootItem[]): RootItem[] => {
    let result: RootItem[] = [];
    for (const item of items) {
      result.push(item);
      if (item.type === 'folder') {
        result = result.concat(flattenItems(item.subfolders));
        result = result.concat(flattenItems(item.files));
      }
    }
    return result;
  };

  const allItems = useMemo(() => flattenItems(items), [items]);

  const filteredItems = useMemo(() => {
    let searchBase: RootItem[];
    if (searchTerm.trim() !== '') {
      searchBase = allItems;
    } else {
      searchBase = currentItems;
    }
    const filtered = searchBase.filter(item => {
      if (filterType === FilterType.ALL) return true;
      if (filterType === FilterType.FILES) return item.type === 'file';
      if (filterType === FilterType.FOLDERS) return item.type === 'folder';
      return true;
    });
    if (searchTerm.trim() !== '') {
      return filtered.filter(item => {
        const name = item.type === 'folder' ? item.name : item.title;
        return name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      });
    }
    return filtered;
  }, [allItems, currentItems, filterType, searchTerm]);

  const groupedItems = useMemo(() => {
    const files = filteredItems
      .filter(item => item.type === 'file')
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    const recentFiles = files
      .slice(0, 4)
      .sort((a, b) => a.title.localeCompare(b.title));

    const remainingItems = [
      ...filteredItems.filter(item => item.type === 'folder'),
      ...files.slice(4),
    ].sort((a, b) =>
      (a.type === 'folder' ? a.name : a.title).localeCompare(
        b.type === 'folder' ? b.name : b.title
      )
    );

    const sortedItems = [...recentFiles, ...remainingItems];

    if (sortedItems.length <= 4) {
      return { lastEdited: sortedItems, others: [], shouldGroup: false };
    }

    return {
      lastEdited: recentFiles,
      others: remainingItems,
      shouldGroup: true,
    };
  }, [filteredItems]);

  const countAllItems = (
    items: RootItem[]
  ): { folderCount: number; fileCount: number } => {
    let folderCount = 0;
    let fileCount = 0;
    items.forEach(item => {
      if (item.type === 'folder') {
        folderCount++;
        const subCounts = countAllItems([
          ...(item.subfolders || []),
          ...(item.files || []),
        ]);
        folderCount += subCounts.folderCount;
        fileCount += subCounts.fileCount;
      } else {
        fileCount++;
      }
    });
    return { folderCount, fileCount };
  };

  const itemCount = useMemo(() => {
    return countAllItems(items);
  }, [items]);

  // Regex kiểm tra tên hợp lệ theo chuẩn Windows
  const isValidWindowsName = (name: string) => {
    // Không cho phép các ký tự: \/:*?"<>| và không cho phép tên chỉ là dấu chấm hoặc rỗng
    const invalidPattern = /[\\/:*?"<>|]/;
    if (!name.trim()) return false;
    if (name === '.' || name === '..') return false;
    return !invalidPattern.test(name);
  };

  // Kiểm tra độ dài tên (tối đa 30 ký tự)
  const isValidNameLength = (name: string) => {
    return name.trim().length <= 30;
  };

  const handleCreateItem = async () => {
    setCreateLoading(true);

    if (!itemName.trim()) {
      setCreateErrorMessage('Name cannot be empty');
      setCreateLoading(false);
      return;
    }
    if (!isValidNameLength(itemName)) {
      setCreateErrorMessage('Name must be 30 characters or less');
      setCreateLoading(false);
      return;
    }
    if (!isValidWindowsName(itemName)) {
      setCreateErrorMessage(
        'Name contains invalid characters (\\ / : * ? " < > |) or is not allowed.'
      );
      setCreateLoading(false);
      return;
    }
    const isDuplicate = checkNameExistsInCurrentFolder(
      itemName,
      createType === 'note'
    );
    if (isDuplicate) {
      setCreateErrorMessage(
        `A ${createType === 'folder' ? 'folder' : 'note'} with that name already exists in this folder.`
      );
      setCreateLoading(false);
      return;
    }
    setCreateErrorMessage('');

    const parentId =
      folderStack.length > 0 ? folderStack[folderStack.length - 1]._id : null;

    try {
      const stackIds = folderStack.map(folder => folder._id);

      if (createType === 'folder') {
        await dispatch(createFolder({ parentId, name: itemName })).unwrap();
        toast.success('Folder created successfully');
        SocketService.emitFolderStructureChanged();
      } else {
        await dispatch(createNote({ parentId, title: itemName })).unwrap();
        toast.success('Note created successfully');
        SocketService.emitFolderStructureChanged();
      }

      await dispatch(fetchItems());
      setPendingSync(stackIds);
      setItemName('');
      setIsModalInputName(false);
    } catch (error: any) {
      console.error('Cannot create item:', error.message);
      toast.error('Failed to create item');
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    if (pendingSync.length > 0) {
      const updatedStack = syncFolderItemAfterFetch(items, pendingSync);
      dispatch(setFolderStack(updatedStack));
      setPendingSync([]);
    }
  }, [items, pendingSync, dispatch]);

  const handleOpenFolder = (folder: RootItem) => {
    // Kiểm tra xem có đang trong chế độ format AI không
    if (isAiFormatting) {
      dispatch(setShowWarningModal(true));
      return; // Không cho phép chuyển folder
    }

    if (folder.type === 'folder') {
      dispatch(pushFolderStack(folder));
    }
  };

  const handleGoBack = () => {
    // Kiểm tra xem có đang trong chế độ format AI không
    if (isAiFormatting) {
      dispatch(setShowWarningModal(true));
      return; // Không cho phép quay lại folder
    }

    dispatch(popFolderStack());
  };

  const findNoteInState = (noteId: string): NoteItem | undefined => {
    for (const item of items) {
      if (item.type === 'file' && item._id === noteId) {
        return item as NoteItem;
      }
      if (item.type === 'folder') {
        const file = item.files.find((file: NoteItem) => file._id === noteId);
        if (file) return file;
        for (const subfolder of item.subfolders) {
          const subFile = subfolder.files.find(
            (file: NoteItem) => file._id === noteId
          );
          if (subFile) return subFile;
        }
      }
    }
    return undefined;
  };

  const handleSelectNote = async (note: RootItem) => {
    if (note.type === 'file') {
      if (!note._id) {
        console.error('Note does not have _id:', note);
        toast.error('Invalid note selected');
        return;
      }
      if (isAiFormatting) {
        dispatch(setShowWarningModal(true));
        return;
      }

      // Nếu đang chọn chính note hiện tại thì không làm gì
      if (currentNote && currentNote._id === note._id) {
        return;
      }

      try {
        // Chỉ gửi các thông tin cơ bản của note mà không bao gồm nội dung
        // Nội dung sẽ được lấy thông qua socket khi kết nối
        dispatch(
          setCurrentNote({
            _id: note._id,
            title: note.title,
            type: 'file',
            content: '', // Để trống nội dung
            folder_id: note.folder_id,
            user_id: note.user_id,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          })
        );

        // Socket sẽ tự động lấy nội dung đầy đủ khi kết nối tới note
      } catch (error) {
        console.error('Error selecting note:', error);
        toast.error('Failed to load note');
      }
    }
  };

  // Hàm đệ quy build path từ root đến folder cha chứa file
  const buildPathToFileFromRoot = (
    items: RootItem[],
    fileId: string,
    path: FolderItem[] = []
  ): FolderItem[] | null => {
    for (const item of items) {
      if (item.type === 'folder') {
        if (item.files.some(file => file._id === fileId)) {
          return [...path, item];
        }
        const subPath = buildPathToFileFromRoot(item.subfolders, fileId, [
          ...path,
          item,
        ]);
        if (subPath) return subPath;
      }
    }
    return null;
  };

  // Hàm tìm đường dẫn đến folder (dùng cho click folder khi search)
  const findPathToItem = (
    items: RootItem[],
    targetId: string,
    path: FolderItem[] = []
  ): FolderItem[] | null => {
    for (const item of items) {
      if (item._id === targetId) {
        return path;
      }
      if (item.type === 'folder') {
        const subPath = findPathToItem(item.subfolders, targetId, [
          ...path,
          item,
        ]);
        if (subPath) return subPath;
      }
    }
    return null;
  };

  const handleClickItem = (item: RootItem) => {
    if (searchTerm.trim() !== '' && item.type === 'file') {
      const path = buildPathToFileFromRoot(items, item._id) || [];
      dispatch(setFolderStack(path));
      setSearchTerm('');
    } else if (searchTerm.trim() !== '' && item.type === 'folder') {
      const path = findPathToItem(items, item._id) || [];
      dispatch(setFolderStack(path.concat(item as FolderItem)));
      setSearchTerm('');
    } else if (item.type === 'file') {
      handleSelectNote(item);
    } else {
      handleOpenFolder(item);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    setDeleteLoading(true);
    try {
      const stackIds = folderStack.map(folder => folder._id);

      await dispatch(deleteItem(selectedItem)).unwrap();
      await dispatch(fetchItems());
      setPendingSync(stackIds);
      setIsActionModalVisible(false);
      setIsDeleteConfirmVisible(false);
      dispatch(setSelectedItem(null));
      toast.success('Item deleted successfully');
    } catch (error: any) {
      console.error('Cannot delete item:', error.message);
      toast.error('Failed to delete item');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRenameItem = async () => {
    setRenameLoading(true);

    if (!selectedItem || !renameInput.trim()) {
      setRenameLoading(false);
      return;
    }

    const isNote = selectedItem.type === 'file';
    const currentName = isNote ? selectedItem.title : selectedItem.name;

    if (renameInput.trim() === currentName.trim()) {
      setRenameModalVisible(false);
      setIsActionModalVisible(false);
      setRenameInput('');
      setRenameLoading(false);
      return;
    }
    if (!isValidNameLength(renameInput)) {
      setRenameErrorMessage('Name must be 30 characters or less');
      setRenameLoading(false);
      return;
    }
    if (!isValidWindowsName(renameInput)) {
      setRenameErrorMessage(
        'Name contains invalid characters (\ / : * ? " < > |) or is not allowed.'
      );
      setRenameLoading(false);
      return;
    }
    const isDuplicate = checkNameExistsInCurrentFolder(renameInput, isNote);
    if (isDuplicate) {
      setRenameErrorMessage('Name already exists in this folder');
      setRenameLoading(false);
      return;
    }

    try {
      const stackIds = folderStack.map(folder => folder._id);
      await dispatch(
        renameItem({ name: renameInput, item: selectedItem })
      ).unwrap();
      await dispatch(fetchItems());
      setPendingSync(stackIds);
      setRenameModalVisible(false);
      setIsActionModalVisible(false);
      dispatch(setSelectedItem(null));
      setRenameInput('');
      toast.success('Item renamed successfully');
    } catch (error: any) {
      console.error('Cannot rename item:', error.message);
      toast.error('Failed to rename item');
    } finally {
      setRenameLoading(false);
    }
  };

  const syncFolderItemAfterFetch = (
    newItems: RootItem[],
    stackIds: string[]
  ): FolderItem[] => {
    const updatedStack: FolderItem[] = [];
    let currentLevel = newItems;

    for (const id of stackIds) {
      const updatedFolder = currentLevel.find(
        item => item._id === id && item.type === 'folder'
      ) as FolderItem | undefined;

      if (!updatedFolder) {
        console.warn(`Cannot find folder with ID ${id} when syncing`);
        break;
      }
      updatedStack.push(updatedFolder);
      currentLevel = updatedFolder.subfolders ?? [];
    }

    return updatedStack;
  };

  const getFilterDisplayText = () => {
    switch (filterType) {
      case FilterType.ALL:
        return 'All';
      case FilterType.FILES:
        return 'Files';
      case FilterType.FOLDERS:
        return 'Folders';
      default:
        return 'All';
    }
  };

  const handleFilterChange = (type: FilterType) => {
    dispatch(setFilterType(type));
    setIsFilterDropdownOpen(false);
  };

  const checkNameExistsInCurrentFolder = (
    name: string,
    isNote: boolean
  ): boolean => {
    const currentFolder =
      folderStack.length > 0
        ? folderStack[folderStack.length - 1]
        : {
            files: items.filter(i => i.type === 'file'),
            subfolders: items.filter(i => i.type === 'folder'),
          };

    if (isNote) {
      return currentFolder.files.some(
        (file: NoteItem) =>
          file.title.trim().toLowerCase() === name.trim().toLowerCase()
      );
    } else {
      return currentFolder.subfolders.some(
        (folder: FolderItem) =>
          folder.name.trim().toLowerCase() === name.trim().toLowerCase()
      );
    }
  };

  useEffect(() => {
    setRenameErrorMessage('');
  }, [renameModalVisible]);

  const handleContextMenu = (e: React.MouseEvent, item: RootItem) => {
    e.preventDefault();
    const menuWidth = 150;
    const menuHeight = 120;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > screenW) {
      x = screenW - menuWidth - 10;
    }

    if (y + menuHeight > screenH) {
      y = screenH - menuHeight - 10;
    }

    setContextMenu({ x, y, item });
  };

  useEffect(() => {
    if (!isModalInputName) setCreateErrorMessage('');
  }, [isModalInputName]);

  return {
    // State
    items,
    folderStack,
    loading,
    error,
    currentNote,
    filterType,
    selectedItem,
    isAiFormatting,
    isModalInputName,
    isActionModalVisible,
    isDeleteConfirmVisible,
    renameModalVisible,
    itemName,
    renameErrorMessage,
    contextMenu,
    renameInput,
    createType,
    pendingSync,
    isFilterDropdownOpen,
    searchTerm,
    createErrorMessage,
    filteredItems,
    groupedItems,
    itemCount,
    createLoading,
    renameLoading,
    deleteLoading,

    // State setters
    setIsModalInputName,
    setIsActionModalVisible,
    setIsDeleteConfirmVisible,
    setRenameModalVisible,
    setItemName,
    setRenameErrorMessage,
    setContextMenu,
    setRenameInput,
    setCreateType,
    setPendingSync,
    setIsFilterDropdownOpen,
    setSearchTerm,
    setCreateErrorMessage,

    // Functions
    handleCreateItem,
    handleOpenFolder,
    handleGoBack,
    handleSelectNote,
    handleClickItem,
    handleDeleteItem,
    handleRenameItem,
    handleFilterChange,
    handleContextMenu,
    getFilterDisplayText,
    checkNameExistsInCurrentFolder,
  };
};
