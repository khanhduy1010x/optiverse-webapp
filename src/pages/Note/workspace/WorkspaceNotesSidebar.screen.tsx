import React from 'react';
import { formatDateTimeShort } from '../../../utils/date.utils';
import Icon from '../../../components/common/Icon/Icon.component';
import WorkspaceFolderFileItem from './WorkspaceFolderFileItem.screen';
import WorkspaceToolBar from './WorkspaceToolBar.screen';
import { RootItem } from './WorkspaceEditor.screen';

interface FolderStack {
    _id: string;
    name: string;
    type: 'folder';
}

interface ContextMenuState {
    x: number;
    y: number;
    item: RootItem;
}

interface WorkspaceNotesSidebarProps {
    items: RootItem[];
    selectedItem: RootItem | null;
    searchTerm: string;
    filterType: 'all' | 'files' | 'folders';
    isFilterDropdownOpen: boolean;
    contextMenu: ContextMenuState | null;
    isNoteAdmin?: boolean;
    onSearchChange: (term: string) => void;
    onFilterChange: (filter: 'all' | 'files' | 'folders') => void;
    onFilterDropdownToggle: (open: boolean) => void;
    onItemClick: (item: RootItem) => void;
    onContextMenu: (e: React.MouseEvent, item: RootItem) => void;
    onContextMenuClose: () => void;
    onDeleteItem: () => void;
    onShowDeleteConfirm: () => void;
    onShowRenameModal: () => void;
    onCreateFolder: () => void;
    onCreateNote: () => void;
    folderStack: FolderStack[];
    onNavigateFolder: (folder: RootItem) => void;
    onGoBack: () => void;
    onNavigateToBreadcrumb: (level: number) => void;
}

/**
 * Generate breadcrumb with ellipsis for long paths
 * Shows first 1 folder, ... and last 2 folders if path is long
 */
const generateBreadcrumb = (folderStack: FolderStack[]): (FolderStack | null)[] => {
    if (folderStack.length <= 3) {
        return folderStack;
    }
    // Show first folder, ellipsis (null), last 2 folders
    return [folderStack[0], null, folderStack[folderStack.length - 2], folderStack[folderStack.length - 1]];
};

const WorkspaceNotesSidebar: React.FC<WorkspaceNotesSidebarProps> = ({
    items,
    selectedItem,
    searchTerm,
    filterType,
    isFilterDropdownOpen,
    contextMenu,
    isNoteAdmin = true,
    onSearchChange,
    onFilterChange,
    onFilterDropdownToggle,
    onItemClick,
    onContextMenu,
    onContextMenuClose,
    onDeleteItem,
    onShowDeleteConfirm,
    onShowRenameModal,
    onCreateFolder,
    onCreateNote,
    folderStack,
    onNavigateFolder,
    onGoBack,
    onNavigateToBreadcrumb,
}) => {
    // Filter items based on search and filter type
    const filteredItems = items.filter(item => {
        const title = item.type === 'folder' ? item.name : item.title;
        const matchesSearch = title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterType === 'all' || (filterType === 'files' && item.type === 'file') || (filterType === 'folders' && item.type === 'folder');
        return matchesSearch && matchesFilter;
    });

    // Count items
    const itemCount = {
        fileCount: items.filter(i => i.type === 'file').length,
        folderCount: items.filter(i => i.type === 'folder').length,
    };

    const renderItemRow = (item: RootItem) => {
        const formatDateTime = (dateString: string) => {
            return formatDateTimeShort(dateString);
        };

        const handleItemClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            // If it's a folder, navigate into it instead of selecting
            if (item.type === 'folder') {
                onNavigateFolder(item);
            } else {

                onItemClick(item);
            }
        };

        return (
            <div
                key={item._id}
                onClick={handleItemClick}
                onContextMenu={e => {
                    e.preventDefault();
                    if (!isNoteAdmin) return;
                    onContextMenu(e, item);
                }}
                className={`${item.type === 'folder' ? 'cursor-pointer hover:bg-blue-50' : ''}`}
            >
                <WorkspaceFolderFileItem
                    type={item.type}
                    title={item.type === 'folder' ? item.name : item.title}
                    updatedAt={formatDateTime(item.updatedAt).replace(' ', ' ')}
                    noteCount={item.type === 'folder' ? (item.files?.length || 0) + (item.subfolders?.length || 0) : undefined}
                    isActive={item.type === 'file' && selectedItem?._id === item._id}
                    showContextButton={isNoteAdmin}
                    onContextMenu={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (!isNoteAdmin) return;
                        onContextMenu(e, item);
                    }}
                />
            </div>
        );
    };

    return (
        <div className="w-[320px] bg-white flex flex-col h-full border-l border-gray-200">
            <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Workspace Notes</h2>
                    {folderStack.length > 0 && (
                        <button
                            onClick={onGoBack}
                            className="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center gap-1"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7"></path>
                            </svg>
                            Back
                        </button>
                    )}
                </div>

                <p className="text-sm text-gray-500 mb-3">
                    {itemCount.fileCount} files, {itemCount.folderCount} folders
                </p>
                <div className="relative mb-3">
                    <button
                        onClick={() => onFilterDropdownToggle(!isFilterDropdownOpen)}
                        className="w-full bg-gray-800 text-white px-4 py-3 cursor-pointer rounded-lg text-sm font-medium flex items-center justify-between hover:bg-gray-900 transition-colors"
                    >
                        <span>{filterType === 'all' ? 'All Items' : filterType === 'files' ? 'Files Only' : 'Folders Only'}</span>
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
                            <div className="fixed inset-0 z-10" onClick={() => onFilterDropdownToggle(false)} />
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                {(['all', 'files', 'folders'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            onFilterChange(type);
                                            onFilterDropdownToggle(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${filterType === type ? 'bg-[#e6f7f9] text-[#21b4ca]' : ''
                                            }`}
                                    >
                                        {type === 'all' ? 'All Items' : type === 'files' ? 'Files Only' : 'Folders Only'}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Search */}
                <div className="mb-3">
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#21b4ca]"
                        placeholder="Search file or folder..."
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Breadcrumb Navigation - Horizontal with Ellipsis and Clickable */}
                {folderStack.length > 0 && (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
                        <div className="flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                            {/* Home Icon - Click to go back to root */}
                            <button
                                onClick={() => onNavigateToBreadcrumb(-1)}
                                className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                                title="Go to root"
                            >
                                <Icon name="home" size={14} color="#666" />
                            </button>
                            {generateBreadcrumb(folderStack).map((folder, index) => {
                                // Find actual index of this folder in the original stack
                                const actualIndex = folder ? folderStack.findIndex(f => f._id === folder._id) : -1;

                                return (
                                    <React.Fragment key={folder ? folder._id : 'ellipsis'}>
                                        {folder ? (
                                            <>
                                                <span className="text-gray-400 flex-shrink-0">/</span>
                                                <button
                                                    onClick={() => onNavigateToBreadcrumb(actualIndex)}
                                                    className="text-[#21b4ca] hover:text-[#1a8fa3] hover:underline transition-colors flex-shrink-0 cursor-pointer"
                                                >
                                                    {folder.name}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-gray-400 flex-shrink-0">/</span>
                                                <span className="text-gray-400 flex-shrink-0">...</span>
                                            </>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Items List */}
            <div
                className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar"
                style={{ WebkitOverflowScrolling: 'touch', willChange: 'scroll-position' }}
            >
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="#9CA3AF">
                                <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
                            </svg>
                        </div>
                        <p className="text-center text-gray-500">No files or folders found.</p>
                        <p className="text-center text-gray-400 text-sm mt-2">Create a new file or folder to get started.</p>
                    </div>
                ) : (
                    filteredItems.map(renderItemRow)
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && isNoteAdmin && (
                <>
                    {/* Click-away overlay to close context menu */}
                    <div className="fixed inset-0 z-40" onClick={onContextMenuClose} />
                    <div
                        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50  w-48"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button
                            onClick={() => {
                                onShowRenameModal();
                            }}
                            className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm flex items-center"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Rename
                        </button>
                        <button
                            onClick={() => {
                                onShowDeleteConfirm();
                            }}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm flex items-center"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete
                        </button>
                        <div className="border-t border-gray-200 "></div>
                        <button
                            onClick={() => onContextMenuClose()}
                            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 text-sm"
                        >
                            Close
                        </button>
                    </div>
                </>
            )}

            {/* Toolbar */}
            {isNoteAdmin && <WorkspaceToolBar onCreateFolder={onCreateFolder} onCreateNote={onCreateNote} />}
        </div>
    );
};

export default WorkspaceNotesSidebar;
