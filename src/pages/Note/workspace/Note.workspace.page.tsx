import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { getWorkspaceNoteTree, setItems } from '../../../store/slices/workspaceNoteSlice';
import workspaceNoteService from '../../../services/workspace-note.service';
import SocketService from '../../../services/socket.service';
import WorkspaceEditor, { RootItem } from './WorkspaceEditor.screen';
import type { RootItem as TypesRootItem } from '../../../types/note/note.types';
import WorkspaceNotesSidebar from './WorkspaceNotesSidebar.screen';
import CreateModal from '../CreateModal.screen';
import RenameModal from '../RenameModal.screen';
import DeleteModal from '../DeleteModal.screen';
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
    const [isNoteAdmin, setIsNoteAdmin] = useState<boolean>(false);
    const [noteContent, setNoteContent] = useState<string>(''); // Track real-time note content from WebSocket
    const [isLoadingNote, setIsLoadingNote] = useState(false); // Loading state when switching notes
    const [isNoteDeleted, setIsNoteDeleted] = useState(false); // Track if current note was deleted

    // Check if selected note allows editing
    const checkNotePermission = (item: RootItem | null) => {
        if (!item || item.type === 'folder') {
            setCanEditNote(false);
            return;
        }
        // Check if user has edit permission (ADMIN role or owner)
        // For now, assume workspace notes are editable unless marked as view-only
        const hasEditPerm = isNoteAdmin && (!item.permission || item.permission === 'edit');
        setCanEditNote(hasEditPerm);
    };

    // Connect to WebSocket for real-time note updates - use selectedNote instead
    const noteId = selectedNote?.type === 'file' ? selectedNote._id : null;

    // Main WebSocket connection for workspace - Connect immediately when entering the page
    useEffect(() => {
        if (!workspaceId) return;

        console.log('🔌 Connecting to workspace WebSocket:', workspaceId);

        // Join workspace room for all workspace events (structure changes, note/folder operations)
        const userId = localStorage.getItem('user_id') || '';
        if (userId) {
            console.log('🏢 Joining workspace room:', workspaceId, 'for user:', userId);
            SocketService.joinWorkspaceRoom(workspaceId, userId);
        } else {
            console.warn('⚠️ No user ID found, cannot join workspace room');
        }

        // Handle workspace structure changes (includes note/folder creation, moves, etc.)
        const handleWorkspaceStructureChanged = (data: any) => {
            console.log('🔄 Workspace structure changed by another user:', data);
            // Always refresh tree for structure changes
            if (workspaceId) {
                dispatch(getWorkspaceNoteTree(workspaceId) as any);
            }
        };

        // Handle note creation by other users
        const handleNoteCreated = (data: any) => {
            console.log('📄 New note created by another user:', data);
            console.log('📄 Current workspaceId:', workspaceId);
            console.log('📄 Event workspaceId:', data.workspaceId);
            if (data.workspaceId === workspaceId) {
                console.log('📄 Workspace IDs match, refreshing tree...');
                // Refresh tree to show new note
                dispatch(getWorkspaceNoteTree(workspaceId) as any);
            } else {
                console.log('📄 Workspace IDs do not match, ignoring event');
            }
        };

        // Handle folder creation by other users
        const handleFolderCreated = (data: any) => {
            console.log('📁 New folder created by another user:', data);
            console.log('📁 Current workspaceId:', workspaceId);
            console.log('📁 Event workspaceId:', data.workspaceId);
            if (data.workspaceId === workspaceId) {
                console.log('📁 Workspace IDs match, refreshing tree...');
                // Refresh tree to show new folder
                dispatch(getWorkspaceNoteTree(workspaceId) as any);
            } else {
                console.log('📁 Workspace IDs do not match, ignoring event');
            }
        };

        // Handle note deletion by other users
        const handleNoteDeleted = (data: any) => {
            console.log('🗑️ Note deleted by another user:', data.noteId);

            setSelectedNote((currentNote) => {
                if (currentNote && data.noteId === currentNote._id) {
                    setIsNoteDeleted(true);
                    // Show toast notification that the current note was deleted
                    toast.warning(`The note "${currentNote.title || 'Untitled'}" has been deleted by another user.`);
                    // Keep selectedNote in state so we can show "Note Deleted" UI
                    return currentNote;
                }
                return currentNote;
            });

            // Refresh tree for all users to update structure
            if (workspaceId) {
                dispatch(getWorkspaceNoteTree(workspaceId) as any);
            }
        };

        // Handle note rename by other users
        const handleNoteRenamed = (data: any) => {
            console.log('✏️ Note renamed by another user:', { noteId: data.noteId, newTitle: data.newTitle });

            // Update selected note title if it matches
            setSelectedNote((currentNote) => {
                if (currentNote && data.noteId === currentNote._id) {
                    return {
                        ...currentNote,
                        title: data.newTitle,
                    } as RootItem;
                }
                return currentNote;
            });

            // Refresh tree for all users to update structure
            if (workspaceId) {
                dispatch(getWorkspaceNoteTree(workspaceId) as any);
            }
        };

        // Handle folder deletion by other users
        const handleFolderDeleted = (data: any) => {
            console.log('🗑️ Folder deleted by another user:', data.folderId);

            // Check if user is affected by the folder deletion (inside deleted folder or its subfolder)
            const affectedResult = isUserAffectedByFolderDeletion(data.folderId);

            if (affectedResult.isAffected) {
                // User is inside the deleted folder or its subfolder
                const folderName = affectedResult.folderName || 'folder';

                // Navigate to the appropriate level (parent of deleted folder, or root if deleted folder was at root)
                setFolderStack(affectedResult.newStack || []);

                // Clear selected note and any deletion state since user is being moved
                setSelectedNote(null);
                setIsNoteDeleted(false);

                // Show toast notification
                if (affectedResult.newStack && affectedResult.newStack.length > 0) {
                    const parentFolder = affectedResult.newStack[affectedResult.newStack.length - 1];
                    toast.warning(`The folder "${folderName}" has been deleted. You have been moved to "${parentFolder.name}".`);
                } else {
                    toast.warning(`The folder "${folderName}" has been deleted. You have been moved to the workspace root.`);
                }

                console.log('📂 User was inside deleted folder, moved to parent or root');
            } else {
                // Check if currently selected note was in the deleted folder
                setSelectedNote((currentNote) => {
                    if (
                        currentNote &&
                        currentNote.type === 'file' &&
                        (currentNote as any).folder_id === data.folderId
                    ) {
                        setIsNoteDeleted(true);
                        return null;
                    }
                    return currentNote;
                });
            }

            // Refresh tree for all users to update structure
            // Navigation path validation will be handled by useEffect when items change
            if (workspaceId) {
                dispatch(getWorkspaceNoteTree(workspaceId) as any);
            }
        };

        // Handle folder rename by other users
        const handleFolderRenamed = (data: any) => {
            console.log('📁 Folder renamed by another user:', { folderId: data.folderId, newName: data.newName });

            // Refresh tree for all users to update structure
            if (workspaceId) {
                dispatch(getWorkspaceNoteTree(workspaceId) as any);
            }
        };



        // Register all workspace-level event listeners
        console.log('🔌 Setting up workspace event listeners for workspace:', workspaceId);
        SocketService.on('note_created', handleNoteCreated);
        SocketService.on('note_renamed', handleNoteRenamed);
        SocketService.on('note_deleted', handleNoteDeleted);
        SocketService.on('folder_created', handleFolderCreated);
        SocketService.on('folder_renamed', handleFolderRenamed);
        SocketService.on('folder_deleted', handleFolderDeleted);
        SocketService.on('folder_structure_changed', handleWorkspaceStructureChanged);
        console.log('✅ All workspace event listeners registered');

        return () => {
            console.log('🔌 Disconnecting from workspace WebSocket:', workspaceId);

            // Clean up all workspace-level event listeners
            SocketService.off('note_created', handleNoteCreated);
            SocketService.off('note_renamed', handleNoteRenamed);
            SocketService.off('note_deleted', handleNoteDeleted);
            SocketService.off('folder_created', handleFolderCreated);
            SocketService.off('folder_renamed', handleFolderRenamed);
            SocketService.off('folder_deleted', handleFolderDeleted);
            SocketService.off('folder_structure_changed', handleWorkspaceStructureChanged);

            // Leave workspace room
            SocketService.leaveWorkspaceRoom(workspaceId);
        };
    }, [workspaceId, dispatch]);

    // Listen for real-time updates on selected note (note content editing)
    useEffect(() => {
        if (!noteId) {
            setIsLoadingNote(false);
            return;
        }

        console.log('📝 Joining note room for real-time editing:', noteId);

        // Reset deleted state when switching to a new note
        setIsNoteDeleted(false);

        // Set loading when switching to a new note
        setIsLoadingNote(true);
        setNoteContent(''); // Clear old content

        // Join note room in SocketService for real-time content editing
        SocketService.joinNote(noteId);

        // Register listener for note content updates (real-time editing)
        const handleNoteContentUpdate = (data: any) => {
            console.log('📥 Received note content update from another user:', data);
            if (data.noteId === noteId) {
                setNoteContent(data.content);
                // Add delay before stopping loading for better UX
                setTimeout(() => {
                    setIsLoadingNote(false);
                }, 500);
            }
        };

        // Handle note deletion while viewing it (specific to current note)
        const handleNoteDeletedWhileViewing = (data: any) => {
            console.log('🗑️ Current viewing note was deleted:', data.noteId);
            if (data.noteId === noteId) {
                setIsNoteDeleted(true);
                setIsLoadingNote(false);
            }
        };

        SocketService.on('note_update', handleNoteContentUpdate);
        SocketService.on('note_deleted', handleNoteDeletedWhileViewing);

        return () => {
            console.log('📝 Leaving note room:', noteId);
            SocketService.off('note_update', handleNoteContentUpdate);
            SocketService.off('note_deleted', handleNoteDeletedWhileViewing);
            SocketService.leaveNote(noteId);
        };
    }, [noteId]);

    // Fetch workspace note tree on mount
    useEffect(() => {
        if (workspaceId) {
            dispatch(getWorkspaceNoteTree(workspaceId) as any);
        }
    }, [workspaceId, dispatch]);

    // Fetch NOTE permission (NOTE_ADMIN) when entering the page
    useEffect(() => {
        const fetchPermission = async () => {
            if (!workspaceId) return;
            try {
                const resp = await workspaceNoteService.getNoteAdminPermission(workspaceId);
                setIsNoteAdmin(!!resp?.isNoteAdmin);
            } catch (e) {
                setIsNoteAdmin(false);
            }
        };
        fetchPermission();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId]);

    useEffect(() => {
        if (!selectedNote) return;
        checkNotePermission(selectedNote);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNoteAdmin]);

    // Validate navigation path when tree items change (handles folder deletions that affect current path)
    useEffect(() => {
        if (!items || items.length === 0 || folderStack.length === 0) {
            return;
        }

        const validStack = validateAndFixNavigationPath(items as RootItem[]);

        if (validStack.length !== folderStack.length) {
            console.log('📂 Navigation path validation: path was affected by tree changes', {
                originalLength: folderStack.length,
                validLength: validStack.length,
                originalPath: folderStack.map(f => f.name).join(' > '),
                validPath: validStack.map(f => f.name).join(' > ')
            });

            // Update navigation to valid path
            setFolderStack(validStack);

            // Clear selected note since path changed
            setSelectedNote(null);
            setIsNoteDeleted(false);

            // Show toast notification about navigation change
            const removedFolders = folderStack.slice(validStack.length);
            if (removedFolders.length > 0) {
                const firstRemovedFolder = removedFolders[0];

                if (validStack.length > 0) {
                    const currentFolder = validStack[validStack.length - 1];
                    toast.warning(`The folder "${firstRemovedFolder.name}" in your navigation path has been deleted. You have been moved to "${currentFolder.name}".`);
                } else {
                    toast.warning(`The folder "${firstRemovedFolder.name}" in your navigation path has been deleted. You have been moved to the workspace root.`);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

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

    // Helper function to check if a deleted folder affects the current navigation path
    const isUserAffectedByFolderDeletion = (deletedFolderId: string): { isAffected: boolean; folderName?: string; newStack?: FolderStack[] } => {
        if (folderStack.length === 0) {
            return { isAffected: false };
        }

        // Get the deleted folder info before it's removed from tree
        const deletedFolderItem = findItemInTree(deletedFolderId);
        const deletedFolderName = deletedFolderItem?.name || 'folder';

        // Check if the deleted folder is directly in the current path
        const deletedFolderIndex = folderStack.findIndex(folder => folder._id === deletedFolderId);

        if (deletedFolderIndex !== -1) {
            // User is inside the deleted folder or its subfolder
            const newStack = folderStack.slice(0, deletedFolderIndex);

            return {
                isAffected: true,
                folderName: deletedFolderName,
                newStack: newStack
            };
        }

        return { isAffected: false };
    };

    // Helper function to validate and fix current navigation path after tree refresh
    const validateAndFixNavigationPath = (refreshedItems: RootItem[]): FolderStack[] => {
        if (folderStack.length === 0) {
            return folderStack;
        }

        let validStack: FolderStack[] = [];
        let currentTree = refreshedItems;

        for (const stackFolder of folderStack) {
            // Try to find this folder in current tree level
            const foundFolder = currentTree.find(item =>
                item._id === stackFolder._id && item.type === 'folder'
            );

            if (foundFolder) {
                // Folder still exists, add to valid stack and go deeper
                validStack.push(stackFolder);
                currentTree = foundFolder.subfolders || [];
            } else {
                // Folder no longer exists, stop here
                break;
            }
        }

        return validStack;
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

        const MENU_WIDTH = 192; // w-48 => 12rem => 192px
        const PADDING = 8;
        let x = e.clientX - MENU_WIDTH - PADDING; // position to the left of cursor
        if (x < PADDING) {
            // If too far left, fallback to small padding from left edge
            x = PADDING;
        }

        // Basic vertical positioning; adjust if near bottom
        let y = e.clientY + 5;
        const APPROX_MENU_HEIGHT = 170; // rough height
        if (y + APPROX_MENU_HEIGHT > window.innerHeight) {
            y = window.innerHeight - APPROX_MENU_HEIGHT - PADDING;
            if (y < PADDING) y = PADDING;
        }

        setContextMenu({
            x,
            y,
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

                // Emit socket event for other users
                SocketService.emitFolderDeleted(deleteConfirmModal.item._id);
            } else {
                try {
                    // Call note delete API
                    await workspaceNoteService.deleteNote(workspaceId, deleteConfirmModal.item._id);
                    toast.success('Note deleted successfully');

                    // Emit socket event for other users (include workspaceId)
                    SocketService.emitNoteDeleted(deleteConfirmModal.item._id, workspaceId);
                } catch (deleteError: any) {
                    // Check if error is about note not found, but still refresh tree
                    // as note might have been deleted by another user
                    if (deleteError.message?.includes('Note not found')) {
                        console.log('Note may have been deleted by another user, refreshing tree...');
                        toast.info('Note was already deleted');
                    } else {
                        throw deleteError; // Re-throw other errors
                    }
                }
            }

            // Clear selection
            setSelectedItem(null);
            if (selectedNote?._id === deleteConfirmModal.item._id) {
                setSelectedNote(null);
            }
            setContextMenu(null);
            setDeleteConfirmModal({ isOpen: false, item: null });

            // Refresh tree regardless of API success/failure
            dispatch(getWorkspaceNoteTree(workspaceId) as any);
        } catch (error: any) {
            console.error('Delete error:', error);
            const errorMessage = workspaceNoteService.extractErrorMessage(error, 'Failed to delete item');
            toast.error(workspaceNoteService.improveErrorMessage(errorMessage));
        }
    };

    const handleShowDeleteConfirm = () => {
        const target = contextMenu?.item || selectedItem;
        if (!target) return;
        setDeleteConfirmModal({ isOpen: true, item: target });
        setContextMenu(null);
    };

    const handleRenameItem = async (newName: string): Promise<void> => {
        const target = renameModal.item;
        if (!target || !newName.trim() || !workspaceId) return;

        try {
            if (target.type === 'folder') {
                // Call folder rename API
                await workspaceNoteService.renameFolder(workspaceId, target._id, newName);
                toast.success('Folder renamed successfully');

                // Emit socket event for other users
                SocketService.emitFolderRenamed(target._id, newName);
            } else {
                // Call note rename API
                await workspaceNoteService.renameNote(workspaceId, target._id, newName);
                toast.success('Note renamed successfully');

                // Emit socket event for other users (include workspaceId)
                SocketService.emitNoteRenamed(target._id, newName, workspaceId);
            }

            // Update local state selections if they point to the renamed item
            const updatedItem = { ...target, name: newName, title: newName } as RootItem;
            if (selectedItem?._id === target._id) {
                setSelectedItem(updatedItem);
            }
            if (selectedNote?._id === target._id) {
                setSelectedNote(updatedItem);
            }
            setRenameModal({ isOpen: false, item: null, newName: '' });
            setContextMenu(null);

            // Refresh tree immediately (no delay needed since other users will get event via WS)
            dispatch(getWorkspaceNoteTree(workspaceId) as any);
        } catch (error: any) {
            console.error('Rename error:', error);
            const errorMessage = workspaceNoteService.extractErrorMessage(error, 'Failed to rename item');
            toast.error(workspaceNoteService.improveErrorMessage(errorMessage));
        }
    };

    const handleShowRenameModal = () => {
        const target = contextMenu?.item || selectedItem;
        if (!target) return;
        const currentName = target.type === 'folder' ? target.name : target.title;
        setRenameModal({ isOpen: true, item: target, newName: currentName || '' });
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

                // Manually add new folder to Redux state - current user immediate update
                const newItem: RootItem = {
                    _id: newFolder._id,
                    name: newFolder.name,
                    type: 'folder',
                    updatedAt: newFolder.updatedAt,
                    subfolders: [],
                    files: [],
                };

                // Update state with new item for current user
                const updatedItems = addItemToTree(items as RootItem[], newItem, folderStack);
                dispatch(setItems(updatedItems as any));

                // Emit WebSocket event to notify other users
                SocketService.emitFolderStructureChanged();

                toast.success('Folder created successfully');
            } else {
                const newNote = await workspaceNoteService.createNote(workspaceId, createModal.name.trim(), parentFolderId);

                // Manually add new note to Redux state - current user immediate update
                const newItem: RootItem = {
                    _id: newNote._id,
                    title: newNote.title,
                    type: 'file',
                    updatedAt: newNote.updatedAt,
                };

                // Update state with new item for current user
                const updatedItems = addItemToTree(items as RootItem[], newItem, folderStack);
                dispatch(setItems(updatedItems as any));

                // Emit WebSocket event to notify other users
                SocketService.emitFolderStructureChanged();

                toast.success('Note created successfully');
            }

            // Close modal
            setCreateModal({
                isOpen: false,
                type: null,
                name: '',
            });
        } catch (error: any) {
            const errorMessage = workspaceNoteService.extractErrorMessage(error, 'Failed to create item');
            toast.error(workspaceNoteService.improveErrorMessage(errorMessage));
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
                        onNoteUpdate={(noteId: string, content: string) => SocketService.updateNote(content)}
                        noteContent={noteContent}
                        isLoading={isLoadingNote}
                        isNoteDeleted={isNoteDeleted}
                    />

                    {/* Sidebar - Right */}
                    <WorkspaceNotesSidebar
                        items={getFilteredItems()}
                        selectedItem={selectedItem}
                        searchTerm={searchTerm}
                        filterType={filterType}
                        isFilterDropdownOpen={isFilterDropdownOpen}
                        contextMenu={contextMenu}
                        isNoteAdmin={isNoteAdmin}
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

            {/* Create Modal (shared UI) */}
            <CreateModal
                isOpen={createModal.isOpen}
                onClose={handleCloseCreateModal}
                itemName={createModal.name}
                setItemName={(val: string) => setCreateModal({ ...createModal, name: val })}
                createType={createModal.type || 'note'}
                onCreate={handleCreateSubmit}
                loading={isCreating}
            />

            {/* Rename Modal (shared UI) */}
            <RenameModal
                isOpen={renameModal.isOpen && !!renameModal.item}
                onClose={() => setRenameModal({ isOpen: false, item: null, newName: '' })}
                renameInput={renameModal.newName}
                setRenameInput={(val: string) => setRenameModal({ ...renameModal, newName: val })}
                selectedItem={renameModal.item as unknown as TypesRootItem | null}
                onRename={() => handleRenameItem(renameModal.newName)}
            />

            {/* Delete Modal (shared UI) */}
            <DeleteModal
                isOpen={deleteConfirmModal.isOpen && !!deleteConfirmModal.item}
                onClose={() => setDeleteConfirmModal({ isOpen: false, item: null })}
                selectedItem={deleteConfirmModal.item as unknown as TypesRootItem | null}
                onDelete={handleDeleteItem}
                onOpenActionModal={() => { /* no-op */ }}
            />
        </div>
    );
};

export default NoteWorkspacePage;

