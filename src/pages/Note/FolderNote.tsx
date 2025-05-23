import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import { RootState, AppDispatch } from '../../store';
import { fetchFolders, createFolder, pushFolderStack, popFolderStack, deleteFolder, renameFolder, setFolderStack } from '../../store/slices/folderSlice';
import { fetchNotes, createNote, setCurrentNote, deleteNote, renameNote } from '../../store/slices/noteSlice';
import { setFilterType, toggleFolderNoteBar, setSelectedItem } from '../../store/slices/uiSlice';
import { FilterType, RootItem, FolderItem } from '../../types/note.types';
import FolderFileComponent from './FolderFileComponent';
import SelectTypeFilter from './SelectTypeFilter';
import ToolBarFolder from './ToolBarFolder';
import { formatDateTime } from '../../utils/dateUtils';

Modal.setAppElement('#root');

const FolderNote: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { folders, folderStack, loading: folderLoading } = useSelector((state: RootState) => state.folders);
  const { notes, loading: noteLoading } = useSelector((state: RootState) => state.notes);
  const { filterType, isShowFolderNoteBar, selectedItem } = useSelector((state: RootState) => state.ui);
  const [isModalInputName, setIsModalInputName] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [renameInput, setRenameInput] = useState('');
  const [createType, setCreateType] = useState<'folder' | 'note'>('folder');

  useEffect(() => {
    dispatch(fetchFolders());
    dispatch(fetchNotes());
  }, [dispatch]);

  const currentItems = useMemo(() => {
    if (folderStack.length > 0) {
      const currentFolder = folderStack[folderStack.length - 1];
      return [...(currentFolder.subfolders || []), ...(currentFolder.files || [])];
    }
    return [...folders, ...notes];
  }, [folderStack, folders, notes]);

  const filteredItems = useMemo(() => {
    return currentItems.filter((item) =>
      filterType === FilterType.FILES
        ? item.type === 'file'
        : filterType === FilterType.FOLDERS
        ? item.type === 'folder'
        : true
    );
  }, [currentItems, filterType]);

  const handleCreateItem = async () => {
    if (!folderName.trim()) return;
    const parentId = folderStack.length > 0 ? folderStack[folderStack.length - 1]._id : null;
    try {
      if (createType === 'folder') {
        await dispatch(createFolder({ parentId, name: folderName })).unwrap();
      } else {
        await dispatch(createNote({ parentId, title: folderName })).unwrap();
      }
      setFolderName('');
      setIsModalInputName(false);
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleOpenFolder = (folder: FolderItem) => {
    dispatch(pushFolderStack(folder));
  };

  const handleGoBack = () => {
    dispatch(popFolderStack());
  };

  const handleItemPress = (item: RootItem) => {
    dispatch(setSelectedItem(item));
    setIsActionModalVisible(true);
  };

  const handleSelectNote = (note: RootItem) => {
    if (note.type === 'file') {
      dispatch(setCurrentNote(note));
      dispatch(toggleFolderNoteBar());
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    try {
      if (selectedItem.type === 'folder') {
        await dispatch(deleteFolder(selectedItem)).unwrap();
      } else {
        await dispatch(deleteNote(selectedItem)).unwrap();
      }
      setIsActionModalVisible(false);
      setIsDeleteConfirmVisible(false);
      dispatch(setSelectedItem(null));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleRenameItem = async () => {
    if (!selectedItem || !renameInput.trim()) return;
    try {
      if (selectedItem.type === 'folder') {
        await dispatch(renameFolder({ name: renameInput, id: selectedItem._id })).unwrap();
      } else {
        await dispatch(renameNote({ title: renameInput, note: selectedItem })).unwrap();
      }
      setRenameModalVisible(false);
      setIsActionModalVisible(false);
      dispatch(setSelectedItem(null));
    } catch (error) {
      console.error('Failed to rename item:', error);
    }
  };

  return (
    <Modal
      isOpen={isShowFolderNoteBar}
      onRequestClose={() => dispatch(toggleFolderNoteBar())}
      style={{
        content: {
          top: '0',
          left: '0',
          bottom: '0',
          width: '300px',
          backgroundColor: '#fff',
          borderRadius: '0 12px 12px 0',
          padding: '20px',
        },
      }}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-lg font-bold">UserName</h2>
          <p className="text-sm text-gray-500">8 files, 3 folders</p>
        </div>
        <SelectTypeFilter
          filterType={filterType}
          setFilterType={(type) => dispatch(setFilterType(type))}
        />
        {folderStack.length > 0 && (
          <div className="flex items-center mb-4">
            <button onClick={handleGoBack} className="mr-2">
              <svg height="28" viewBox="0 -960 960 960" width="28" fill="#000">
                <path d="M560-280 360-480l200-200v400Z" />
              </svg>
            </button>
            <div className="flex overflow-x-auto">
              <button onClick={() => dispatch(setFolderStack([]))} className="font-bold">
                Root
              </button>
              {folderStack.map((folder, index) => (
                <span key={folder._id} className="flex items-center">
                  <span className="mx-2">/</span>
                  <button
                    onClick={() => dispatch(setFolderStack(folderStack.slice(0, index + 1)))}
                    className="font-bold"
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        {folderLoading || noteLoading ? (
          <div className="flex justify-center items-center mt-10">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-center mt-10">No files or folders found.</p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => (item.type === 'folder' ? handleOpenFolder(item) : handleSelectNote(item))}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleItemPress(item);
                  }}
                  className="cursor-pointer"
                >
                  <FolderFileComponent
                    type={item.type}
                    title={item.type === 'folder' ? item.name : item.title}
                    updatedAt={formatDateTime(item.updatedAt)}
                    noteCount={item.type === 'folder' ? (item.subfolders?.length || 0) + (item.files?.length || 0) : undefined}
                  />
                </div>
              ))
            )}
          </div>
        )}
        <ToolBarFolder setIsModalInputName={setIsModalInputName} setCreateType={setCreateType} />
        <Modal
          isOpen={isModalInputName}
          onRequestClose={() => {
            setIsModalInputName(false);
            setFolderName('');
          }}
          style={{
            content: {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              padding: '20px',
              borderRadius: '12px',
            },
          }}
        >
          <h3 className="text-lg font-semibold mb-4 text-center">
            Enter {createType === 'folder' ? 'folder' : 'file'} name
          </h3>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder={`${createType === 'folder' ? 'Folder' : 'File'} name`}
            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setIsModalInputName(false);
                setFolderName('');
              }}
              className="text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateItem}
              className="text-blue-600 font-semibold"
              disabled={!folderName.trim()}
            >
              Create
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={isActionModalVisible}
          onRequestClose={() => {
            setIsActionModalVisible(false);
            setIsDeleteConfirmVisible(false);
            dispatch(setSelectedItem(null));
          }}
          style={{
            content: {
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '300px',
              padding: '20px',
              borderRadius: '16px 16px 0 0',
            },
          }}
        >
          <div className="flex flex-col">
            <div className="w-9 h-1.5 bg-gray-300 rounded-full self-center mb-3" />
            {!isDeleteConfirmVisible ? (
              <>
                <h3 className="text-base font-semibold mb-1">
                  {selectedItem?.type === 'folder' ? selectedItem.name : selectedItem?.title}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  Last modified at {formatDateTime(selectedItem?.updatedAt || '')}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Created at {formatDateTime(selectedItem?.createdAt || '')}
                </p>
                <button
                  onClick={() => {
                    if (selectedItem) {
                      setRenameInput(selectedItem.type === 'folder' ? selectedItem.name : selectedItem.title);
                      setIsActionModalVisible(false);
                      setRenameModalVisible(true);
                    }
                  }}
                  className="py-3 text-base"
                >
                  Rename
                </button>
                <button
                  onClick={() => setIsDeleteConfirmVisible(true)}
                  className="py-3 text-base text-red-600"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-center mb-4">
                  Are you sure you want to delete "
                  {selectedItem?.type === 'folder' ? selectedItem.name : selectedItem?.title}"?
                </p>
                <button
                  onClick={handleDeleteItem}
                  className="bg-red-600 text-white py-3 rounded-lg mb-2"
                >
                  Confirm delete
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsActionModalVisible(false);
                setIsDeleteConfirmVisible(false);
                dispatch(setSelectedItem(null));
              }}
              className="py-3 text-base text-gray-500 text-center"
            >
              Cancel
            </button>
          </div>
        </Modal>
        <Modal
          isOpen={renameModalVisible}
          onRequestClose={() => setRenameModalVisible(false)}
          style={{
            content: {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              padding: '20px',
              borderRadius: '12px',
            },
          }}
        >
          <h3 className="text-lg font-semibold mb-4 text-center">
            Rename {selectedItem?.type === 'folder' ? 'folder' : 'file'}
          </h3>
          <input
            type="text"
            value={renameInput}
            onChange={(e) => setRenameInput(e.target.value)}
            placeholder="New name"
            className="w-full border border-gray-300 rounded-lg p-2 mb-4"
          />
          <div className="flex justify-end gap-4">
            <button onClick={() => setRenameModalVisible(false)} className="text-gray-500">
              Cancel
            </button>
            <button
              onClick={handleRenameItem}
              className="text-blue-600 font-semibold"
              disabled={!renameInput.trim()}
            >
              Save
            </button>
          </div>
        </Modal>
      </div>
    </Modal>
  );
};

export default FolderNote;