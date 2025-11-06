import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { getWorkspaceNoteTree, setItems } from '../../../store/slices/workspaceNoteSlice';
import workspaceNoteService from '../../../services/workspace-note.service';
import { useWorkspaceWebSocket } from '../../../hooks/websocket/useWorkspaceWebSocket';
import WorkspaceEditor, { RootItem } from './WorkspaceEditor.screen';
import WorkspaceNotesSidebar from './WorkspaceNotesSidebar.screen';
import { toast } from 'react-toastify';

interface ContextMenuState {
    x: number;
    y: number;
    item: RootItem;
}

interface CreateModalState {
    isOpen: boolean;
    type: 'folder' | 'note' | null;
    name: string;
}

interface RenameModalState {
    isOpen: boolean;
    item: RootItem | null;
    newName: string;
}

interface DeleteConfirmModalState {
    isOpen: boolean;
    item: RootItem | null;
}

interface FolderStack {
    _id: string;
    name: string;
    type: 'folder';
}

const NoteWorkspacePage: React.FC = () => {
    const { workspaceId } = useParams();
    const dispatch = useDispatch();
    const { items, loading, error } = useSelector((state: RootState) => state.workspaceNote);

    const [selectedItem, setSelectedItem] = useState<RootItem | null>(null);
    const [selectedNote, setSelectedNote] = useState<RootItem | null>(null); // Separate state for edited note
    const [searchTerm, setSearchTerm] = useState('');
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'files' | 'folders'>('all');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [createModal, setCreateModal] = useState<CreateModalState>({
        isOpen: false,
        type: null,
        name: '',
    });
    const [renameModal, setRenameModal] = useState<RenameModalState>({
        isOpen: false,
        item: null,
        newName: '',
    });
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<DeleteConfirmModalState>({
        isOpen: false,
        item: null,
    });
    const [isCreating, setIsCreating] = useState(false);
    const [folderStack, setFolderStack] = useState<FolderStack[]>([]);
    const [canEditNote, setCanEditNote] = useState(false);
    const [noteContent, setNoteContent] = useState<string>(''); // Track real-time note content from other users

    // Check if selected note allows editing
    const checkNotePermission = (item: RootItem | null) => {
        if (!item || item.type === 'folder') {
            setCanEditNote(false);
            return;
        }
        // Check if user has edit permission (ADMIN role or owner)
        // For now, assume workspace notes are editable unless marked as view-only
        const hasEditPerm = !item.permission || item.permission === 'edit';
        setCanEditNote(hasEditPerm);
    };

    // Connect to WebSocket for real-time note updates - use selectedNote instead
    const noteId = selectedNote?.type === 'file' ? selectedNote._id : null;
    console.log("Selected Note ID for WebSocket:", noteId);
    const { emitNoteUpdate, onNoteUpdate } = useWorkspaceWebSocket({
        workspaceId: workspaceId || null,
        isDashboard: false,
        selectedNoteId: noteId,
        canEditNote,
    });

    // Listen for real-time updates on selected note (silent updates, no notifications)
    useEffect(() => {
        if (!noteId) return;

        const unsubscribe = onNoteUpdate(noteId, (data) => {
            console.log('📥 Received note update from another user:', data);
            // Update content from other user's changes
            setNoteContent(data.content);
        });

        return unsubscribe;
    }, [noteId]); // onNoteUpdate is stable (useCallback), no need to depend on it

    // Reset note content when deselecting or switching note
    useEffect(() => {
        if (!noteId) {
            setNoteContent('');
        }
    }, [noteId]);

    // Fetch note content from API when selectedNote changes
    useEffect(() => {
        if (!selectedNote || selectedNote.type !== 'file' || !workspaceId) {
            return;
        }

        const fetchNoteContent = async () => {
            try {
                const response = await workspaceNoteService.getNoteDetail(workspaceId, selectedNote._id);
                if (response?.content) {
                    setNoteContent(response.content);
                }
                // Update selectedNote with permission from backend
                if (response?.permission) {
                    setSelectedNote({
                        ...selectedNote,
                        permission: response.permission as 'view' | 'edit',
                    });
                    checkNotePermission({
                        ...selectedNote,
                        permission: response.permission as 'view' | 'edit',
                    });
                }
            } catch (error) {
                console.error('Error fetching note content:', error);
            }
        };

        fetchNoteContent();
    }, [selectedNote?._id, workspaceId]);

    // Fetch workspace note tree on mount
    useEffect(() => {
        if (workspaceId) {
            dispatch(getWorkspaceNoteTree(workspaceId) as any);
        }
    }, [workspaceId, dispatch]);

    /**
     * Find an item in the tree by ID (recursive search)
     */
    const findItemInTree = (itemId: string, tree: RootItem[] = items as RootItem[]): RootItem | null => {
        for (const item of tree) {
            if (item._id === itemId) {
                return item;
            }
            if (item.type === 'folder' && item.subfolders) {
                const found = findItemInTree(itemId, item.subfolders);
                if (found) return found;
            }
        }
        return null;
    };

    /**
     * Get current folder's items (files + subfolders)
     */
    const getCurrentItems = (): RootItem[] => {
        if (folderStack.length === 0) {
            // Root level - show all root items
            return items as RootItem[];
        }

        // Find the current folder
        const currentFolderId = folderStack[folderStack.length - 1]._id;
        const currentFolder = findItemInTree(currentFolderId);

        if (!currentFolder || currentFolder.type !== 'folder') {
            return [];
        }

        const allItems = [...(currentFolder.files || []), ...(currentFolder.subfolders || [])];
        return allItems;
    };

    /**
     * Get filtered items based on search and filter type
     */
    const getFilteredItems = (): RootItem[] => {
        const currentItems = getCurrentItems();

        return currentItems.filter(item => {
            const title = item.type === 'folder' ? item.name : item.title;
            const matchesSearch = title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter =
                filterType === 'all' ||
                (filterType === 'files' && item.type === 'file') ||
                (filterType === 'folders' && item.type === 'folder');
            return matchesSearch && matchesFilter;
        });
    };

    /**
     * Add item to tree at current folder level
     */
    const addItemToTree = (tree: RootItem[], newItem: RootItem, stack: FolderStack[]): RootItem[] => {
        if (stack.length === 0) {
            // Add to root
            return [...tree, newItem];
        }

        // Deep copy tree
        const updatedTree = JSON.parse(JSON.stringify(tree)) as RootItem[];

        // Find the target folder and add item to it
        const findAndAdd = (items: RootItem[], targetId: string): boolean => {
            for (const item of items) {
                if (item._id === targetId && item.type === 'folder') {
                    if (newItem.type === 'folder') {
                        item.subfolders = item.subfolders || [];
                        item.subfolders.push(newItem);
                    } else {
                        item.files = item.files || [];
                        item.files.push(newItem);
                    }
                    return true;
                }
                if (item.type === 'folder' && item.subfolders) {
                    if (findAndAdd(item.subfolders, targetId)) return true;
                }
            }
            return false;
        };

        const targetFolderId = stack[stack.length - 1]._id;
        findAndAdd(updatedTree, targetFolderId);
        return updatedTree;
    };

    /**
     * Navigate into a folder
     */
    const handleNavigateFolder = (folder: RootItem) => {
        if (folder.type !== 'folder') return;
        setFolderStack([...folderStack, { _id: folder._id, name: folder.name || '', type: 'folder' }]);
        setSelectedItem(null);
        setSearchTerm('');
    };

    /**
     * Go back one level
     */
    const handleGoBack = () => {
        if (folderStack.length > 0) {
            setFolderStack(folderStack.slice(0, -1));
            setSelectedItem(null);
        }
    };

    /**
     * Navigate to a specific folder level in breadcrumb
     */
    const handleNavigateToBreadcrumb = (targetLevel: number) => {
        // targetLevel = -1 means go to root
        // targetLevel = 0, 1, 2... means go to that level
        if (targetLevel < -1) return;

        if (targetLevel === -1) {
            // Go to root
            setFolderStack([]);
        } else {
            // Go to specific level
            setFolderStack(folderStack.slice(0, targetLevel + 1));
        }
        setSelectedItem(null);
    };

    const handleClickItem = (item: RootItem) => {
        setSelectedItem(item);

        // If note is clicked, update selectedNote as well
        if (item.type === 'file') {
            setSelectedNote(item);
            checkNotePermission(item);
        } else {
            // If folder is clicked, just update selectedItem but keep selectedNote
            checkNotePermission(null);
        }

        setContextMenu(null);
    };

    const handleContextMenu = (e: React.MouseEvent, item: RootItem) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX - 110,
            y: e.clientY + 5,
            item,
        });

        // Only update selectedItem if it's a note (don't change selection for folder context menu)
        if (item.type === 'file') {
            setSelectedItem(item);
            setSelectedNote(item);
        }
    };

    const handleDeleteItem = async () => {
        if (!deleteConfirmModal.item || !workspaceId) return;

        try {
            if (deleteConfirmModal.item.type === 'folder') {
                // Call folder delete API
                await workspaceNoteService.deleteFolder(workspaceId, deleteConfirmModal.item._id);
                toast.success('Folder deleted successfully');
            } else {
                // Call note delete API
                await workspaceNoteService.deleteNote(workspaceId, deleteConfirmModal.item._id);
                toast.success('Note deleted successfully');
            }

            // Clear selection
            setSelectedItem(null);
            if (selectedNote?._id === deleteConfirmModal.item._id) {
                setSelectedNote(null);
            }
            setContextMenu(null);
            setDeleteConfirmModal({ isOpen: false, item: null });

            // Refresh tree
            dispatch(getWorkspaceNoteTree(workspaceId) as any);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete item');
        }
    };

    const handleShowDeleteConfirm = () => {
        if (!selectedItem) return;
        setDeleteConfirmModal({ isOpen: true, item: selectedItem });
        setContextMenu(null);
    };

    const handleRenameItem = async (newName: string) => {
        if (!selectedItem || !newName.trim() || !workspaceId) return;

        try {
            if (selectedItem.type === 'folder') {
                // Call folder rename API
                await workspaceNoteService.renameFolder(workspaceId, selectedItem._id, newName);
                toast.success('Folder renamed successfully');
            } else {
                // Call note rename API
                await workspaceNoteService.renameNote(workspaceId, selectedItem._id, newName);
                toast.success('Note renamed successfully');
            }

            // Update local state
            const updatedItem = { ...selectedItem, name: newName, title: newName };
            setSelectedItem(updatedItem);
            if (selectedNote?._id === selectedItem._id) {
                setSelectedNote(updatedItem);
            }
            setRenameModal({ isOpen: false, item: null, newName: '' });
            setContextMenu(null);

            // Refresh tree
            dispatch(getWorkspaceNoteTree(workspaceId) as any);
        } catch (error) {
            console.error('Rename error:', error);
            toast.error('Failed to rename item');
        }
    };

    const handleShowRenameModal = () => {
        if (!selectedItem) return;
        const currentName = selectedItem.type === 'folder' ? selectedItem.name : selectedItem.title;
        setRenameModal({ isOpen: true, item: selectedItem, newName: currentName || '' });
        setContextMenu(null);
    };

    const handleCreateFolder = () => {
        setCreateModal({
            isOpen: true,
            type: 'folder',
            name: '',
        });
    };

    const handleCreateNote = () => {
        setCreateModal({
            isOpen: true,
            type: 'note',
            name: '',
        });
    };

    const handleCreateSubmit = async () => {
        if (!workspaceId || !createModal.name.trim() || !createModal.type) return;

        setIsCreating(true);
        try {
            // Get the parent folder ID (current folder in folderStack or null for root)
            const parentFolderId = folderStack.length > 0 ? folderStack[folderStack.length - 1]._id : null;

            if (createModal.type === 'folder') {
                const newFolder = await workspaceNoteService.createFolder(workspaceId, createModal.name.trim(), parentFolderId);

                // Manually add new folder to Redux state - sidebar only
                const newItem: RootItem = {
                    _id: newFolder._id,
                    name: newFolder.name,
                    type: 'folder',
                    updatedAt: newFolder.updatedAt,
                    subfolders: [],
                    files: [],
                };

                // Update state with new item
                const updatedItems = addItemToTree(items as RootItem[], newItem, folderStack);
                dispatch(setItems(updatedItems as any));

                toast.success('Folder created successfully');
            } else {
                const newNote = await workspaceNoteService.createNote(workspaceId, createModal.name.trim(), parentFolderId);

                // Manually add new note to Redux state - sidebar only
                const newItem: RootItem = {
                    _id: newNote._id,
                    title: newNote.title,
                    type: 'file',
                    updatedAt: newNote.updatedAt,
                };

                // Update state with new item
                const updatedItems = addItemToTree(items as RootItem[], newItem, folderStack);
                dispatch(setItems(updatedItems as any));

                toast.success('Note created successfully');
            }

            // Close modal
            setCreateModal({
                isOpen: false,
                type: null,
                name: '',
            });
        } catch (error: any) {
            toast.error(error.message || 'Failed to create item');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCloseCreateModal = () => {
        setCreateModal({
            isOpen: false,
            type: null,
            name: '',
        });
    };

    return (
        <div className="flex h-[calc(100vh-57px)] bg-white">
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#21b4ca] border-t-transparent"></div>
                        <p className="text-gray-500">Loading workspace notes...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 font-semibold mb-2">Error loading notes</p>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Main Content - Left */}
                    <WorkspaceEditor
                        selectedItem={selectedItem}
                        selectedNote={selectedNote}
                        onDelete={handleDeleteItem}
                        canEdit={canEditNote}
                        onNoteUpdate={emitNoteUpdate}
                        noteContent={noteContent}
                    />

                    {/* Sidebar - Right */}
                    <WorkspaceNotesSidebar
                        items={getFilteredItems()}
                        selectedItem={selectedItem}
                        searchTerm={searchTerm}
                        filterType={filterType}
                        isFilterDropdownOpen={isFilterDropdownOpen}
                        contextMenu={contextMenu}
                        onSearchChange={setSearchTerm}
                        onFilterChange={setFilterType}
                        onFilterDropdownToggle={setIsFilterDropdownOpen}
                        onItemClick={handleClickItem}
                        onContextMenu={handleContextMenu}
                        onContextMenuClose={() => setContextMenu(null)}
                        onDeleteItem={handleDeleteItem}
                        onShowDeleteConfirm={handleShowDeleteConfirm}
                        onShowRenameModal={handleShowRenameModal}
                        onCreateFolder={handleCreateFolder}
                        onCreateNote={handleCreateNote}
                        folderStack={folderStack}
                        onNavigateFolder={handleNavigateFolder}
                        onGoBack={handleGoBack}
                        onNavigateToBreadcrumb={handleNavigateToBreadcrumb}
                    />
                </>
            )}

            {/* Create Modal */}
            {createModal.isOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Create {createModal.type === 'folder' ? 'Folder' : 'Note'}
                        </h2>

                        {/* Show parent folder info */}
                        {folderStack.length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-600">
                                    Creating in: <span className="font-semibold">{folderStack[folderStack.length - 1].name}</span>
                                </p>
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder={createModal.type === 'folder' ? 'Folder name' : 'Note title'}
                            value={createModal.name}
                            onChange={e => setCreateModal({ ...createModal, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21b4ca] mb-4"
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleCreateSubmit();
                                }
                            }}
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCloseCreateModal}
                                disabled={isCreating}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSubmit}
                                disabled={isCreating || !createModal.name.trim()}
                                className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg font-medium hover:bg-[#1a8fa3] disabled:opacity-50"
                            >
                                {isCreating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {renameModal.isOpen && renameModal.item && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Rename {renameModal.item.type === 'folder' ? 'Folder' : 'Note'}
                        </h2>

                        <input
                            type="text"
                            placeholder={renameModal.item.type === 'folder' ? 'Folder name' : 'Note title'}
                            value={renameModal.newName}
                            onChange={e => setRenameModal({ ...renameModal, newName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21b4ca] mb-4"
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleRenameItem(renameModal.newName);
                                }
                                if (e.key === 'Escape') {
                                    setRenameModal({ isOpen: false, item: null, newName: '' });
                                }
                            }}
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setRenameModal({ isOpen: false, item: null, newName: '' })}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRenameItem(renameModal.newName)}
                                disabled={!renameModal.newName.trim()}
                                className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg font-medium hover:bg-[#1a8fa3] disabled:opacity-50"
                            >
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteConfirmModal.isOpen && deleteConfirmModal.item && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirm Delete</h2>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete <span className="font-semibold text-gray-800">
                                {deleteConfirmModal.item.type === 'folder' ? deleteConfirmModal.item.name : deleteConfirmModal.item.title}
                            </span>?
                        </p>
                        <p className="text-sm text-red-600 mb-4">
                            {deleteConfirmModal.item.type === 'folder'
                                ? 'This will delete the folder and all its contents.'
                                : 'This action cannot be undone.'}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmModal({ isOpen: false, item: null })}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteItem}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteWorkspacePage;

