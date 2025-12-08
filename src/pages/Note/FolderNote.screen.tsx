import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatDateTimeShort } from '../../utils/date.utils';
import { FilterType, RootItem } from '../../types/note/note.types';
import ToolBarFolder from './ToolBarFolder.screen';
import CreateModal from './CreateModal.screen';
import RenameModal from './RenameModal.screen';
import DeleteModal from './DeleteModal.screen';
import ShareModal from './ShareModal.screen';
import LeaveModal from './LeaveModal.screen';
import SendToChatModal from './SendToChatModal.screen';
import ImportNoteModal from '../../components/Note/ImportNoteModal.component';
import { ContextMenu } from './ContextMenu.screen';
import FolderFileComponent from './FolderFileComponent.screen';
import { useFolderNote } from '../../hooks/note/useFolderNote.hook';
import { useSharedItems } from '../../hooks/note/useSharedItems.hook';
import { setSelectedItem } from '../../store/slices/ui.slice';
import { setFolderStack, fetchItems } from '../../store/slices/items.slice';
import { truncateText } from '../../utils/string.utils';
import { toast } from 'react-toastify';

const FolderNote: React.FC = () => {
  const dispatch = useDispatch();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [sendToChatModalVisible, setSendToChatModalVisible] = useState(false);
  const [importNoteModalVisible, setImportNoteModalVisible] = useState(false);

  const [sendToChatItem, setSendToChatItem] = useState<RootItem | null>(null);

  const {
    isSharedView,
    loadingShared,
    handleToggleSharedView
  } = useSharedItems();

  const {
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
    leaveLoading,
    isLeaveModalVisible,
    itemToLeave,

    setIsModalInputName,
    setIsActionModalVisible,
    setIsDeleteConfirmVisible,
    setRenameModalVisible,
    setItemName,
    setContextMenu,
    setRenameInput,
    setCreateType,
    setIsFilterDropdownOpen,
    setSearchTerm,
    handleCreateItem,
    handleGoBack,
    handleClickItem,
    handleDeleteItem,
    handleRenameItem,
    handleFilterChange,
    handleContextMenu,
    getFilterDisplayText,
    handleLeaveFolder,
    handleLeaveNote,
    confirmLeave,
    cancelLeave,
  } = useFolderNote();

  const handleShareItem = async () => {
    if (!selectedItem) return;
    setShareModalVisible(false);
  };

  const handleSendToChat = (item: RootItem) => {
    if (!item || item.type !== 'file') {
      toast.error('Only file-type notes can be sent');
      return;
    }
    setSendToChatItem(item);
    setSendToChatModalVisible(true);
    setContextMenu(null);
  };

  const handleOpenImportModal = () => {
    if (isSharedView) {
      toast.warning('Không thể import note trong chế độ xem shared');
      return;
    }
    setImportNoteModalVisible(true);
  };

  const handleCloseImportModal = () => {
    setImportNoteModalVisible(false);
  };

  const renderItemRow = (item: RootItem) => {
    const formatDateTime = (dateString: string) => {
      return formatDateTimeShort(dateString);
    };

    const handleItemContextMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setContextMenu({
        x: e.clientX - 110,
        y: e.clientY + 5,
        item,
      });
    };

    const handleItemLeave = () => {
      if (item.type === 'folder') {
        handleLeaveFolder(item, isSharedView);
      } else {
        handleLeaveNote(item, isSharedView);
      }
    };

    return (
      <div
        key={item._id}
        onClick={() => handleClickItem(item)}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!isSharedView) {
            handleContextMenu(e, item);
          }
        }}
      >
        <FolderFileComponent
          type={item.type}
          title={item.type === 'folder' ? item.name : item.title}
          updatedAt={formatDateTime(item.updatedAt).replace(' ', ' ')}
          noteCount={item.type === 'folder' ? ((item.subfolders?.length || 0) + (item.files?.length || 0)) : undefined}
          isShared={item.isShared}
          permission={item.permission}
          ownerInfo={item.owner_info}
          isActive={item.type === 'file' && currentNote?._id === item._id}
          onContextMenu={!isSharedView ? handleItemContextMenu : undefined}
          isSharedView={isSharedView}
          onLeave={isSharedView && item.isShared ? handleItemLeave : undefined}
        />
      </div>
    );
  };

  return (
    <div className="w-[320px] bg-white flex flex-col h-full">
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            {isSharedView ? (
              <>
                <svg className="mr-2 text-[#21b4ca]" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                </svg>
                Shared with me
              </>
            ) : (
              <>
                <svg className="mr-2 text-gray-700" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
                My Notes
              </>
            )}
          </h2>
          {isSharedView && (
            <button
              onClick={handleToggleSharedView}
              className="text-sm  cursor-pointer text-[#21b4ca] hover:text-[#1a8fa3] flex items-center"
            >
              <svg className="mr-1 text-[#21b4ca]" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back
            </button>
          )}

        </div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {itemCount.fileCount} files, {itemCount.folderCount} folders
            {isSharedView && <span className="ml-1">(shared)</span>}
          </p>
          {!isSharedView && (
            <div className="flex items-center text-xs text-[#21b4ca]">
              <button
                onClick={handleToggleSharedView}
                className="flex items-center cursor-pointer  hover:text-[#1a8fa3]"
              >
                <svg className="mr-1" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                </svg>
                View shared
              </button>
            </div>
          )}
        </div>
        <div className="relative mb-3">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="w-full bg-gray-800 text-white px-4 py-3 cursor-pointer rounded-lg text-sm font-medium flex items-center justify-between hover:bg-gray-900 transition-colors"
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
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer transition-colors ${filterType === FilterType.ALL ? 'bg-[#e6f7f9] text-[#21b4ca] font-medium' : 'text-gray-700'
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
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-100 ${filterType === FilterType.FILES ? 'bg-[#e6f7f9] text-[#21b4ca] font-medium' : 'text-gray-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                        <path
                          d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                          fill="#21b4ca"
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
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100 ${filterType === FilterType.FOLDERS ? 'bg-[#e6f7f9] text-[#21b4ca] font-medium' : 'text-gray-700'
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
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#21b4ca]"
            placeholder="Search file or folder..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm.trim() === '' && folderStack.length > 0 && (
          <div className="flex items-center overflow-x-auto custom-scrollbar-2 bg-gray-50 rounded-lg px-2 py-2 relative">
            <button onClick={handleGoBack} className="mr-2 hover:bg-gray-200 cursor-pointer rounded-full p-1 flex-shrink-0">
              <svg height="20" viewBox="0 -960 960 960" width="20" fill="#000">
                <path d="M560-280 360-480l200-200v400Z" />
              </svg>
            </button>
            <div className="flex items-center overflow-x-auto custom-scrollbar-2 whitespace-nowrap">
              <button
                onClick={() => dispatch(setFolderStack([]))}
                className="text-sm font-medium text-gray-700 hover:text-[#21b4ca] cursor-pointer flex-shrink-0"
              >
                {isSharedView ? 'Shared' : 'Root'}
              </button>
              {folderStack.length <= 2 ? (
                folderStack.map((folder, index) => (
                  <span key={folder._id} className="flex items-center flex-shrink-0">
                    <span className="mx-1 text-gray-400">/</span>
                    <div className="relative">
                      <button
                        onClick={() => dispatch(setFolderStack(folderStack.slice(0, index + 1)))}
                        className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer flex items-center"
                      >
                        <span className="truncate max-w-[100px]" title={folder.name}>
                          {truncateText(folder.name, 17)}
                        </span>
                      </button>
                      {folder.isShared && index === 0 && (
                        <div className="absolute -top-5 right-0">
                          {/* <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded shadow-sm">
                            {folder.permission === 'edit' ? 'Edit' : 'View'}
                          </span> */}
                        </div>
                      )}
                    </div>
                  </span>
                ))
              ) : (
                <>
                  <span className="flex items-center flex-shrink-0">
                    <span className="mx-1 text-gray-400">/</span>
                    <div className="relative">
                      <button
                        onClick={() => dispatch(setFolderStack([folderStack[0]]))}
                        className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer flex items-center"
                      >
                        <span className="truncate max-w-[100px]" title={folderStack[0].name}>
                          {truncateText(folderStack[0].name, 17)}
                        </span>
                      </button>
                      {folderStack[0].isShared && (
                        <div className="absolute -top-5 right-0">
                          <span className="text-xs bg-[#e6f7f9] text-[#21b4ca] px-1.5 py-0.5 rounded shadow-sm">
                            {folderStack[0].permission === 'edit' ? 'Edit' : 'View'}
                          </span>
                        </div>
                      )}
                    </div>
                  </span>
                  <span className="flex items-center flex-shrink-0">
                    <span className="mx-1 text-gray-400">/</span>
                    <span className="text-sm text-gray-500">...</span>
                  </span>
                  <span className="flex items-center flex-shrink-0">
                    <span className="mx-1 text-gray-400">/</span>
                    <button
                      onClick={() => dispatch(setFolderStack(folderStack))}
                      className="text-sm font-medium text-gray-700 hover:text-[#21b4ca] cursor-pointer"
                    >
                      <span className="truncate max-w-[100px]" title={folderStack[folderStack.length - 1].name}>
                        {truncateText(folderStack[folderStack.length - 1].name, 17)}
                      </span>
                    </button>
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {loading || loadingShared ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#21b4ca] border-t-transparent"></div>
          <p className="ml-2">Loading...</p>
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
                  <div className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                    Last Edited
                  </div>
                  {groupedItems.lastEdited.map(renderItemRow)}
                </div>
              )}
              {groupedItems.others.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
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
            <div className="flex flex-col items-center justify-center py-10">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#9CA3AF">
                  <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
                </svg>
              </div>
              <p className="text-center text-gray-500">
                {isSharedView ? 'No shared items found.' : 'No files or folders found.'}
              </p>
              <p className="text-center text-gray-400 text-sm mt-2">
                {isSharedView ?
                  'Items shared with you will appear here.' :
                  'Create a new file or folder to get started.'}
              </p>
            </div>
          )}
        </div>
      )}
      {contextMenu && contextMenu.item && (
        <ContextMenu
          isSharedView={isSharedView}
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onRename={() => {
            dispatch(setSelectedItem(contextMenu.item));
            setRenameModalVisible(true);
            setContextMenu(null);
          }}
          onShare={() => {
            dispatch(setSelectedItem(contextMenu.item));
            setShareModalVisible(true);
            setContextMenu(null);
          }}
          onDelete={() => {
            dispatch(setSelectedItem(contextMenu.item));
            setIsActionModalVisible(true);
            setIsDeleteConfirmVisible(true);
            setContextMenu(null);
          }}
          onSendToChat={async () => {
            if (contextMenu.item) {
              await handleSendToChat(contextMenu.item);
            }
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      <ToolBarFolder
        setIsModalInputName={setIsModalInputName}
        setCreateType={setCreateType}
        onToggleSharedView={handleToggleSharedView}
        isSharedView={isSharedView}
        onImportNote={handleOpenImportModal}
      />
      <ImportNoteModal
        isOpen={importNoteModalVisible}
        onClose={handleCloseImportModal}
        parentFolderId={folderStack.length > 0 ? folderStack[folderStack.length - 1]._id : null}
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
        isOpen={isDeleteConfirmVisible}
        onClose={() => setIsDeleteConfirmVisible(false)}
        selectedItem={selectedItem}
        onDelete={handleDeleteItem}
        onOpenActionModal={() => setIsActionModalVisible(true)}
        loading={deleteLoading}
      />
      <LeaveModal
        isOpen={isLeaveModalVisible}
        onClose={cancelLeave}
        itemToLeave={itemToLeave}
        onConfirm={confirmLeave}
        loading={leaveLoading}
      />
      <ShareModal
        isOpen={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareItem}
        selectedItem={selectedItem}
        loading={false}
        errorMessage={null}
      />
      <SendToChatModal
        isOpen={sendToChatModalVisible}
        onClose={() => setSendToChatModalVisible(false)}
        selectedItem={sendToChatItem}
      />
    </div>
  );
};

export default FolderNote;