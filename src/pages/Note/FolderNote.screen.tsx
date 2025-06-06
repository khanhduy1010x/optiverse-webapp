import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  saveNote,
} from '../../store/slices/items.slice';
import { setFilterType, setSelectedItem, setShowWarningModal } from '../../store/slices/ui.slice';
import { FilterType, RootItem, FolderItem, NoteItem } from '../../types/note.types';
import ToolBarFolder from './ToolBarFolder.screen';
import CreateModal from './CreateModal.screen';
import RenameModal from './RenameModal.screen';
import DeleteModal from './DeleteModal.screen';
import { formatDateTime } from '../../utils/date.utils';
import { toast } from 'react-toastify';
import { ContextMenu } from './ContextMenu.screen';

const FolderNote: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, folderStack, loading, error, currentNote } = useSelector(
    (state: RootState) => state.items
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const { filterType, selectedItem, isAiFormatting } = useSelector(
    (state: RootState) => state.ui
  );
  const [isModalInputName, setIsModalInputName] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [renameErrorMessage, setRenameErrorMessage] = useState('');

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
  const [pendingNoteId, setPendingNoteId] = useState<string | null>(null);
  const [createErrorMessage, setCreateErrorMessage] = useState('');

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const currentItems = useMemo(() => {
    if (folderStack.length > 0) {
      const currentFolder = folderStack[folderStack.length - 1];
      const subfolders = (currentFolder.subfolders || []).map(item => ({
        ...item,
        type: 'folder' as const,
      }));
      const files = (currentFolder.files || []).map(item => ({
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
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const recentFiles = files
      .slice(0, 4)
      .sort((a, b) => a.title.localeCompare(b.title));

    const remainingItems = [
      ...filteredItems.filter(item => item.type === 'folder'),
      ...files.slice(4),
    ].sort((a, b) =>
      (a.type === 'folder' ? a.name : a.title).localeCompare(b.type === 'folder' ? b.name : b.title)
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

  const countAllItems = (items: RootItem[]): { folderCount: number; fileCount: number } => {
    let folderCount = 0;
    let fileCount = 0;
    items.forEach(item => {
      if (item.type === 'folder') {
        folderCount++;
        const subCounts = countAllItems([...(item.subfolders || []), ...(item.files || [])]);
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

  const handleCreateItem = async () => {
    if (!itemName.trim()) {
      setCreateErrorMessage('Name cannot be empty');
      return;
    }
    if (!isValidWindowsName(itemName)) {
      setCreateErrorMessage('Name contains invalid characters (\\ / : * ? " < > |) or is not allowed.');
      return;
    }
    const isDuplicate = checkNameExistsInCurrentFolder(itemName, createType === 'note');
    if (isDuplicate) {
      setCreateErrorMessage(`A ${createType === 'folder' ? 'folder' : 'note'} with that name already exists in this folder.`);
      return;
    }
    setCreateErrorMessage('');

    const parentId = folderStack.length > 0 ? folderStack[folderStack.length - 1]._id : null;

    try {
      const stackIds = folderStack.map(folder => folder._id);

      if (createType === 'folder') {
        await dispatch(createFolder({ parentId, name: itemName })).unwrap();
        toast.success('Folder created successfully');
      } else {
        await dispatch(createNote({ parentId, title: itemName })).unwrap();
        toast.success('Note created successfully');
      }

      await dispatch(fetchItems());
      setPendingSync(stackIds);
      setItemName('');
      setIsModalInputName(false);
    } catch (error: any) {
      console.error('Cannot create item:', error.message);
      toast.error('Failed to create item');
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
        const file = item.files.find(file => file._id === noteId);
        if (file) return file;
        for (const subfolder of item.subfolders) {
          const subFile = subfolder.files.find(file => file._id === noteId);
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

      // Kiểm tra xem có đang trong chế độ format AI không
      if (isAiFormatting) {
        dispatch(setShowWarningModal(true));
        return; // Không cho phép chuyển note
      }

      // Không cần lưu note hiện tại nữa vì đã được xử lý realtime
      const stateNote = findNoteInState(note._id);
      if (stateNote) {
        dispatch(setCurrentNote(stateNote));
        console.log('Selected note:', stateNote.title);
      } else {
        dispatch(setCurrentNote(note));
        console.warn('Note not found in state, using selected note:', note.title);
      }
    }
  };

  // Hàm đệ quy build path từ root đến folder cha chứa file
  const buildPathToFileFromRoot = (items: RootItem[], fileId: string, path: FolderItem[] = []): FolderItem[] | null => {
    for (const item of items) {
      if (item.type === 'folder') {
        if (item.files.some(file => file._id === fileId)) {
          return [...path, item];
        }
        const subPath = buildPathToFileFromRoot(item.subfolders, fileId, [...path, item]);
        if (subPath) return subPath;
      }
    }
    return null;
  };

  // Hàm tìm đường dẫn đến folder (dùng cho click folder khi search)
  const findPathToItem = (items: RootItem[], targetId: string, path: FolderItem[] = []): FolderItem[] | null => {
    for (const item of items) {
      if (item._id === targetId) {
        return path;
      }
      if (item.type === 'folder') {
        const subPath = findPathToItem(item.subfolders, targetId, [...path, item]);
        if (subPath) return subPath;
      }
    }
    return null;
  };

  const handleClickItem = (item: RootItem) => {
    console.log('DEBUG handleClickItem', { searchTerm, item });
    if (searchTerm.trim() !== '' && item.type === 'file') {
      const path = buildPathToFileFromRoot(items, item._id) || [];
      console.log('DEBUG path to file:', path.map(f => ({ id: f._id, name: f.name })));
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
    }
  };

  const handleRenameItem = async () => {
    if (!selectedItem || !renameInput.trim()) return;

    const isNote = selectedItem.type === 'file';
    const currentName = isNote ? selectedItem.title : selectedItem.name;

    if (renameInput.trim() === currentName.trim()) {
      setRenameModalVisible(false);
      setIsActionModalVisible(false);
      setRenameInput('');
      return;
    }
    if (!isValidWindowsName(renameInput)) {
      setRenameErrorMessage('Name contains invalid characters (\ / : * ? " < > |) or is not allowed.');
      return;
    }
    const isDuplicate = checkNameExistsInCurrentFolder(renameInput, isNote);
    if (isDuplicate) {
      setRenameErrorMessage("Name already exists in this folder");
      return;
    }

    try {
      const stackIds = folderStack.map(folder => folder._id);
      await dispatch(renameItem({ name: renameInput, item: selectedItem })).unwrap();
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
    }
  };


  const syncFolderItemAfterFetch = (newItems: RootItem[], stackIds: string[]): FolderItem[] => {
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
  const checkNameExistsInCurrentFolder = (name: string, isNote: boolean): boolean => {
    const currentFolder =
      folderStack.length > 0
        ? folderStack[folderStack.length - 1]
        : { files: items.filter(i => i.type === 'file'), subfolders: items.filter(i => i.type === 'folder') };

    if (isNote) {
      return currentFolder.files.some(file => file.title.trim().toLowerCase() === name.trim().toLowerCase());
    } else {
      return currentFolder.subfolders.some(folder => folder.name.trim().toLowerCase() === name.trim().toLowerCase());
    }
  };
  useEffect(() => {
    setRenameErrorMessage('')
  }, [renameModalVisible])
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

  const renderItemRow = (item: RootItem) => (
    <div
      key={item._id}
      onClick={() => handleClickItem(item)}
      onContextMenu={(e) => handleContextMenu(e, item)}


      className={`flex items-center py-3 px-4 cursor-pointer border-b border-gray-100 ${item.type === 'file' && currentNote?._id === item._id
        ? 'bg-blue-100'
        : 'hover:bg-gray-50'
        }`}
    >
      <div className="mr-3">
        {item.type === 'folder' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4Z"
              fill="#FFB800"
            />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
              fill="#4A90E2"
            />
            <path
              d="M14 2V8H20"
              fill="#FFFFFF"
            />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">
          {item.type === 'folder' ? item.name : item.title}
        </div>
        <div className="text-sm text-gray-500">
          {formatDateTime(item.updatedAt).replace(' ', ' ')}
        </div>
      </div>
      {item.type === 'folder' && (
        <div className="text-sm text-gray-500">
          {((item.subfolders?.length || 0) + (item.files?.length || 0))} items
        </div>
      )}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setContextMenu({
            x: e.clientX - 110,
            y: e.clientY + 5,
            item,
          });
        }}
        className="px-2 py-1 hover:bg-gray-200 rounded cursor-pointer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </div>

    </div>
  );

  useEffect(() => {
    if (!isModalInputName) setCreateErrorMessage('');
  }, [isModalInputName]);

  return (
    <div className="w-[320px] bg-white flex flex-col h-full">
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">User</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {itemCount.fileCount} files, {itemCount.folderCount} folders
        </p>
        <div className="relative mb-3">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between hover:bg-gray-900 transition-colors"
          >
            <span>{getFilterDisplayText()}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="white"
              className={`transform transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M7 10L12 15L17 10H7Z" />
            </svg>
          </button>
          {isFilterDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => handleFilterChange(FilterType.ALL)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterType === FilterType.ALL ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>File & Folder</span>
                    {filterType === FilterType.ALL && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleFilterChange(FilterType.FILES)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-t border-gray-100 ${filterType === FilterType.FILES ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                        <path
                          d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                          fill="#4A90E2"
                        />
                        <path d="M14 2V8H20" fill="#FFFFFF" />
                      </svg>
                      <span>Files</span>
                    </div>
                    {filterType === FilterType.FILES && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleFilterChange(FilterType.FOLDERS)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-t border-gray-100 ${filterType === FilterType.FOLDERS ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                        <path
                          d="M10 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4Z"
                          fill="#FFB800"
                        />
                      </svg>
                      <span>Folders</span>
                    </div>
                    {filterType === FilterType.FOLDERS && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Search file or folder..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm.trim() === '' && folderStack.length > 0 && (
          <div className="flex items-center px-4 py-2">
            <button onClick={handleGoBack} className="mr-2 hover:bg-gray-100 rounded p-1">
              <svg height="20" viewBox="0 -960 960 960" width="20" fill="#000">
                <path d="M560-280 360-480l200-200v400Z" />
              </svg>
            </button>
            <div className="flex items-center overflow-x-auto">
              <button
                onClick={() => dispatch(setFolderStack([]))}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
              >
                Root
              </button>
              {folderStack.length <= 2 ? (
                folderStack.map((folder, index) => (
                  <span key={folder._id} className="flex items-center">
                    <span className="mx-1 text-gray-400">/</span>
                    <button
                      onClick={() => dispatch(setFolderStack(folderStack.slice(0, index + 1)))}
                      className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
                    >
                      {folder.name}
                    </button>
                  </span>
                ))
              ) : (
                <>
                  <span className="flex items-center">
                    <span className="mx-1 text-gray-400">/</span>
                    <button
                      onClick={() => dispatch(setFolderStack([folderStack[0]]))}
                      className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
                    >
                      {folderStack[0].name}
                    </button>
                  </span>
                  <span className="flex items-center">
                    <span className="mx-1 text-gray-400">/</span>
                    <span className="text-sm text-gray-500">...</span>
                  </span>
                  <span className="flex items-center">
                    <span className="mx-1 text-gray-400">/</span>
                    <button
                      onClick={() => dispatch(setFolderStack(folderStack))}
                      className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
                    >
                      {folderStack[folderStack.length - 1].name}
                    </button>
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <p className="text-center mt-10 text-red-500">{error}</p>
      ) : (
        <div
          className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch', willChange: 'scroll-position' }}
        >
          {groupedItems.shouldGroup ? (
            <>
              {groupedItems.lastEdited.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border-b border-gray-200">
                    Last Edited
                  </div>
                  {groupedItems.lastEdited.map(renderItemRow)}
                </div>
              )}
              {groupedItems.others.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border-b border-gray-200">
                    Other Files
                  </div>
                  {groupedItems.others.map(renderItemRow)}
                </div>
              )}
            </>
          ) : (
            filteredItems.map(renderItemRow)
          )}
          {filteredItems.length === 0 && (
            <p className="text-center mt-10 text-gray-500">No files or folders found.</p>
          )}
        </div>
      )}
      {contextMenu && contextMenu.item && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={() => {
            dispatch(setSelectedItem(contextMenu.item));
            setRenameModalVisible(true);
            setContextMenu(null);
          }}
          onDelete={() => {
            dispatch(setSelectedItem(contextMenu.item));
            setIsActionModalVisible(true);
            setIsDeleteConfirmVisible(true);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      <ToolBarFolder
        setIsModalInputName={setIsModalInputName}
        setCreateType={setCreateType}
      />
      <CreateModal
        isOpen={isModalInputName}
        onClose={() => {
          setIsModalInputName(false);
          setItemName('');
        }}
        itemName={itemName}
        setItemName={setItemName}
        createType={createType}
        onCreate={handleCreateItem}
        loading={loading}
        errorMessage={createErrorMessage}
      />
      <RenameModal
        isOpen={renameModalVisible}
        onClose={() => {
          setRenameModalVisible(false);
          setRenameInput('');
        }}
        renameInput={renameInput}
        setRenameInput={setRenameInput}
        selectedItem={selectedItem}
        onRename={handleRenameItem}
        errorMessage={renameErrorMessage}
      />
      <DeleteModal
        isOpen={isActionModalVisible && isDeleteConfirmVisible}
        onClose={() => {
          setIsActionModalVisible(false);
          setIsDeleteConfirmVisible(false);
          dispatch(setSelectedItem(null));
        }}
        selectedItem={selectedItem}
        onDelete={handleDeleteItem}
        onOpenActionModal={() => {
          setIsDeleteConfirmVisible(false);
          setIsActionModalVisible(true);
        }}
      />
    </div>
  );
};

export default FolderNote;