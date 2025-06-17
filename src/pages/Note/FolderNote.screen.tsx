import React from 'react';
import { useDispatch } from 'react-redux';
import { formatDateTime } from '../../utils/date.utils';
import { FilterType, RootItem } from '../../types/note/note.types';
import ToolBarFolder from './ToolBarFolder.screen';
import CreateModal from './CreateModal.screen';
import RenameModal from './RenameModal.screen';
import DeleteModal from './DeleteModal.screen';
import { ContextMenu } from './ContextMenu.screen';
import { useFolderNote } from '../../hooks/note/useFolderNote.hook';
import { setSelectedItem } from '../../store/slices/ui.slice';
import { setFolderStack } from '../../store/slices/items.slice';

const FolderNote: React.FC = () => {
  const dispatch = useDispatch();
  const {
    // State
    items,
    folderStack,
    loading,
    error,
    currentNote,
    filterType,
    selectedItem,
    isModalInputName,
    isActionModalVisible,
    isDeleteConfirmVisible,
    renameModalVisible,
    itemName,
    renameErrorMessage,
    contextMenu,
    renameInput,
    createType,
    isFilterDropdownOpen,
    searchTerm,
    createErrorMessage,
    filteredItems,
    groupedItems,
    itemCount,
    renameLoading,
    createLoading,
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
    setIsFilterDropdownOpen,
    setSearchTerm,
    setCreateErrorMessage,

    // Functions
    handleCreateItem,
    handleOpenFolder,
    handleGoBack,
    handleClickItem,
    handleDeleteItem,
    handleRenameItem,
    handleFilterChange,
    handleContextMenu,
    getFilterDisplayText,
  } = useFolderNote();

  // Hàm truncate tên để hiển thị
  const truncateName = (name: string, maxLength: number = 15) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
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
        <div className="font-medium text-gray-900" title={item.type === 'folder' ? item.name : item.title}>
          {item.type === 'folder' ? truncateName(item.name) : truncateName(item.title)}
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
            <div className="flex items-center overflow-x-auto custom-scrollbar-2">
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
        loading={createLoading}
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
        loading={renameLoading}
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
        loading={deleteLoading}
      />
    </div>
  );
};

export default FolderNote;