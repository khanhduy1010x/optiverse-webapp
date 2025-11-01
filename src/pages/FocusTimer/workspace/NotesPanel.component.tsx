import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-toastify';
import noteService from '../../../services/note.service';
import { createPortal } from 'react-dom';
import { useNoteRoomEvents } from '../../../hooks/speech/useNoteRoomEvents';
import { useAppTranslate } from '../../../hooks/useAppTranslate';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../../../config/env.config';
const quillCustomStyles = `
    .ql-toolbar {
        background-color: #3a3a3a !important;
        border: none !important;
        border-bottom: 1px solid #4a4a4a !important;
    }
    .ql-toolbar.ql-snow .ql-formats {
        margin-right: 15px;
    }
    .ql-toolbar.ql-snow .ql-stroke {
        stroke: #888 !important;
    }
    .ql-toolbar.ql-snow .ql-fill,
    .ql-toolbar.ql-snow .ql-stroke.ql-fill {
        fill: #888 !important;
    }
    .ql-toolbar.ql-snow .ql-picker-label {
        color: #888 !important;
    }
    .ql-toolbar.ql-snow button:hover .ql-stroke,
    .ql-toolbar.ql-snow button.ql-active .ql-stroke {
        stroke: #e5e5e5 !important;
    }
    .ql-toolbar.ql-snow button:hover .ql-fill,
    .ql-toolbar.ql-snow button.ql-active .ql-fill,
    .ql-toolbar.ql-snow button:hover .ql-picker-label,
    .ql-toolbar.ql-snow button.ql-active .ql-picker-label {
        fill: #e5e5e5 !important;
    }
    .ql-container {
        background-color: #2a2a2a !important;
        border: none !important;
        font-size: 14px;
    }
    .ql-editor {
        background-color: #2a2a2a !important;
        color: #e5e5e5 !important;
        padding: 16px 12px;
    }
    .ql-editor.ql-blank::before {
        color: #666 !important;
    }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = quillCustomStyles;
    document.head.appendChild(style);
}

interface Note {
    _id?: string;
    id?: string;
    title: string;
    content: string;
    user_id?: string;
    folder_id?: string | null;
    live_room_id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    type?: 'file';
    permission?: string;
    isShared?: boolean;
    sharedBy?: string;
    owner_info?: any;
}

interface NotesPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    roomId: string;
    width?: number; // percentage
    isResizing?: boolean;
}

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['clean']
    ]
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet',
    'link', 'image',
    'align',
    'color', 'background'
];

const NotesPanel: React.FC<NotesPanelProps> = ({
    isOpen,
    onOpenChange,
    roomId,
    width = 45,
    isResizing = false
}) => {
    const { t } = useAppTranslate('focus-room');
    const [notes, setNotes] = useState<any[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameNoteId, setRenameNoteId] = useState<string | null>(null);
    const [renameNoteTitle, setRenameNoteTitle] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // 1️⃣ Initialize WebSocket connection
    useEffect(() => {
        if (!socketRef.current) {
            const socket = io(`${BASE_URL}speech`, {
                transports: ['websocket'],
                withCredentials: true,
                path: '/productivity/socket.io',
            });
            socketRef.current = socket;
            console.log('📡 Note panel WebSocket connected');
        }
        return () => {
            // Don't disconnect on unmount - keep connection alive for other features
        };
    }, []);

    // 2️⃣ Join/leave note room based on panel state
    useNoteRoomEvents({
        socket: socketRef.current,
        roomId,
        isOpen,
        onNoteCreated: (note) => {
            console.log('📝 Note created:', note);
            // Add new note to list if not already present
            setNotes(prevNotes => {
                const exists = prevNotes.some(n => n._id === note._id);
                if (!exists) {
                    return [...prevNotes, note];
                }
                return prevNotes;
            });
        },
        onNoteUpdated: (note) => {
            console.log('✏️ Note updated:', note);
            // Update note in list
            setNotes(prevNotes => {
                const updated = prevNotes.map(n => n._id === note._id ? { ...n, ...note } : n);
                return updated;
            });
            // If this is the selected note, update selectedNote too
            if (selectedNoteId === note._id) {
                // Force re-render by using key in Quill
                console.log('📝 Selected note content updated');
            }
        },
        onNoteDeleted: (noteId) => {
            console.log('🗑️ Note deleted:', noteId);
            // Remove note from list
            setNotes(prevNotes => prevNotes.filter(n => n._id !== noteId));
            if (selectedNoteId === noteId) {
                setSelectedNoteId(null);
            }
        },
        onNoteRenamed: (data) => {
            console.log('✏️ Note renamed:', data);
            // Update note title in list
            setNotes(prevNotes => {
                const updated = prevNotes.map(n => n._id === data._id ? { ...n, title: data.title } : n);
                return updated;
            });
            // Update selected note title if it's the renamed note
            if (selectedNoteId === data._id) {
                console.log('📝 Selected note title updated');
            }
        },
        onError: (error) => {
            console.error('❌ Note room error:', error);
            toast.error(`Error: ${error.error}`);
        }
    });

    const selectedNote = notes.find(n => (n._id || n.id) === selectedNoteId);

    // 📝 Fetch notes when panel opens
    useEffect(() => {
        if (isOpen && roomId) {
            fetchNotes();
        }
    }, [isOpen, roomId]);

    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            const fetchedNotes = await noteService.getNotesByRoomId(roomId);
            console.log('📋 Fetched notes:', fetchedNotes);
            setNotes(fetchedNotes || []);

            // Select first note if available
            if (fetchedNotes && fetchedNotes.length > 0 && !selectedNoteId) {
                setSelectedNoteId(fetchedNotes[0]._id);
            }
        } catch (error) {
            console.error('❌ Failed to fetch notes:', error);
            toast.error('Failed to fetch notes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async () => {
        setShowCreateModal(true);
        setNewNoteTitle('');
    };

    const handleCreateNote = async () => {
        if (!newNoteTitle.trim()) {
            toast.warning(t('notes.titleRequired'));
            return;
        }

        try {
            setIsCreating(true);
            const userId = localStorage.getItem('user_id') || '';

            // 🌐 Emit via WebSocket instead of REST API
            // Backend will handle creation and broadcast to all users in room
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('createNoteInRoom', {
                    title: newNoteTitle.trim(),
                    content: '',
                    live_room_id: roomId,
                    user_id: userId,
                });

                // Wait for response
                socketRef.current.once('createNoteInRoomSuccess', (data) => {
                    console.log('✅ Note created via WebSocket:', data);
                    setShowCreateModal(false);
                    setNewNoteTitle('');
                    setIsCreating(false);
                });

                socketRef.current.once('createNoteInRoomError', (error) => {
                    console.error('❌ Create note error:', error);
                    toast.error(`Failed: ${error.error}`);
                    setIsCreating(false);
                });
            } else {
                // Fallback to REST API if WebSocket not available
                console.log('⚠️ WebSocket not available, using REST API fallback');
                const newNote = await noteService.createNoteInRoom(newNoteTitle.trim(), roomId);
                console.log('✅ Created note via REST:', newNote);

                setNotes([...notes, newNote]);
                setSelectedNoteId(newNote._id);
                setShowCreateModal(false);
                setNewNoteTitle('');
                setIsCreating(false);
            }
        } catch (error) {
            console.error('❌ Failed to create note:', error);
            toast.error('Failed to create note');
            setIsCreating(false);
        }
    };

    const handleCancelCreateNote = () => {
        setShowCreateModal(false);
        setNewNoteTitle('');
    };

    const handleRenameNote = (id: string, currentTitle: string) => {
        setRenameNoteId(id);
        setRenameNoteTitle(currentTitle);
        setShowRenameModal(true);
    };

    const handleConfirmRename = async () => {
        if (!renameNoteTitle.trim()) {
            toast.warning('Please enter a note title');
            return;
        }

        try {
            setIsRenaming(true);

            // 🌐 Emit via WebSocket
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('renameNoteInRoom', {
                    note_id: renameNoteId,
                    new_title: renameNoteTitle.trim(),
                    live_room_id: roomId,
                });

                socketRef.current.once('renameNoteInRoomSuccess', (data) => {
                    console.log('✅ Note renamed via WebSocket');
                    setShowRenameModal(false);
                    setRenameNoteId(null);
                    setRenameNoteTitle('');
                    setIsRenaming(false);
                });

                socketRef.current.once('renameNoteInRoomError', (error) => {
                    console.error('❌ Rename note error:', error);
                    toast.error(`Failed: ${error.error}`);
                    setIsRenaming(false);
                });
            } else {
                // Fallback to REST API
                console.log('⚠️ WebSocket not available, using REST API fallback');
                await noteService.renameNoteInRoom(
                    renameNoteId!,
                    renameNoteTitle.trim(),
                    roomId
                );

                // Update local state
                setNotes(prevNotes =>
                    prevNotes.map(n =>
                        n._id === renameNoteId
                            ? { ...n, title: renameNoteTitle.trim() }
                            : n
                    )
                );

                setShowRenameModal(false);
                setRenameNoteId(null);
                setRenameNoteTitle('');
                setIsRenaming(false);
            }
        } catch (error) {
            console.error('❌ Failed to rename note:', error);
            toast.error('Failed to rename note');
            setIsRenaming(false);
        }
    };

    const handleCancelRename = () => {
        setShowRenameModal(false);
        setRenameNoteId(null);
        setRenameNoteTitle('');
    };

    const handleDeleteNote = async (id: string) => {
        try {
            setIsLoading(true);

            // 🌐 Emit via WebSocket
            if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('deleteNoteInRoom', {
                    note_id: id,
                    live_room_id: roomId,
                });

                socketRef.current.once('deleteNoteInRoomSuccess', (data) => {
                    console.log('✅ Note deleted via WebSocket');
                    setIsLoading(false);
                });

                socketRef.current.once('deleteNoteInRoomError', (error) => {
                    console.error('❌ Delete note error:', error);
                    toast.error(`Failed: ${error.error}`);
                    setIsLoading(false);
                });
            } else {
                // Fallback to REST API
                console.log('⚠️ WebSocket not available, using REST API fallback');
                await noteService.deleteNoteInRoom(id);

                const filtered = notes.filter(n => n._id !== id);
                setNotes(filtered);
                if (selectedNoteId === id && filtered.length > 0) {
                    setSelectedNoteId(filtered[0]._id);
                }
                setIsLoading(false);
            }
        } catch (error) {
            console.error('❌ Failed to delete note:', error);
            toast.error('Failed to delete note');
            setIsLoading(false);
        }
    };

    const handleUpdateNote = async (id: string, field: 'title' | 'content', value: string) => {
        setNotes(notes.map(n =>
            n._id === id
                ? { ...n, [field]: value, updatedAt: new Date() }
                : n
        ));

        // Auto-save after 2 seconds of no edits
        if (isSavingRef.current) {
            clearTimeout(isSavingRef.current);
        }

        isSavingRef.current = setTimeout(async () => {
            try {
                const note = notes.find(n => n._id === id);
                if (note) {
                    // 🌐 Emit via WebSocket if available
                    if (socketRef.current && socketRef.current.connected) {
                        socketRef.current.emit('updateNoteInRoom', {
                            note_id: note._id,
                            title: field === 'title' ? value : note.title,
                            content: field === 'content' ? value : note.content,
                            live_room_id: roomId,
                        });
                        console.log('📤 Note update emitted via WebSocket');
                    } else {
                        // Fallback to REST API
                        await noteService.updateNoteInRoom(
                            note._id,
                            field === 'title' ? value : note.title,
                            field === 'content' ? value : note.content,
                            roomId
                        );
                        console.log('💾 Note auto-saved via REST API');
                    }
                }
            } catch (error) {
                console.error('❌ Failed to save note:', error);
                toast.error('Failed to save note');
            }
        }, 2000);
    };

    const isSavingRef = React.useRef<NodeJS.Timeout | null>(null);

    return (
        <div
            className={`${isOpen
                ? 'flex flex-col rounded-xl overflow-hidden max-h-[calc(100%-1rem)]'
                : 'fixed bottom-36 left-4 w-12 h-12 rounded-full shadow-lg'
                }`}
            style={{
                backgroundColor: '#272727',
                width: isOpen ? `${width}%` : 'auto',
                height: isOpen ? '100%' : 'auto',
                borderRadius: isOpen ? '8px' : '50%',
                margin: isOpen ? '8px 8px 8px 0' : '0',
                marginBottom: isOpen ? '2rem' : '0',
                zIndex: 40,
                transition: isResizing ? 'none' : 'all 0.2s ease-out'
            }}
        >
            {/* Create Note Modal */}
            {showCreateModal && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]" style={{ backdropFilter: 'blur(4px)' }}>
                    <div className="rounded-2xl p-6 w-96 shadow-xl border" style={{
                        background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                        borderColor: '#404040',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}>
                        <h3 className="text-lg font-semibold text-white mb-4">Create New Note</h3>

                        <input
                            type="text"
                            value={newNoteTitle}
                            onChange={(e) => setNewNoteTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateNote()}
                            placeholder="Enter note title..."
                            autoFocus
                            className="w-full px-4 py-2 bg-[#1f1f1f] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                            style={{ borderColor: '#404040' }}
                        />

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={handleCancelCreateNote}
                                disabled={isCreating}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateNote}
                                disabled={isCreating || !newNoteTitle.trim()}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Rename Note Modal */}
            {showRenameModal && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]" style={{ backdropFilter: 'blur(4px)' }}>
                    <div className="bg-[#2a2a2a] rounded-lg p-6 w-96 shadow-xl border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Rename Note</h3>

                        <input
                            type="text"
                            value={renameNoteTitle}
                            onChange={(e) => setRenameNoteTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleConfirmRename()}
                            placeholder="Enter new title..."
                            autoFocus
                            className="w-full px-4 py-2 bg-[#1f1f1f] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
                        />

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={handleCancelRename}
                                disabled={isRenaming}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRename}
                                disabled={isRenaming || !renameNoteTitle.trim()}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRenaming ? 'Renaming...' : 'Rename'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {isOpen && (
                <>
                    <div className="flex items-center justify-between px-6 py-5 border-b backdrop-blur-xl" style={{
                        borderColor: '#404040',
                        background: 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    }}>
                        <div>
                            <h3 className="text-base font-semibold text-white tracking-tight">{t('notes.title')}</h3>
                            <p className="text-xs text-gray-500 mt-1">{t('notes.collaborativeEditing')}</p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-all duration-200 text-gray-400 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto" style={{
                        background: 'linear-gradient(180deg, rgba(42, 42, 42, 0.2) 0%, rgba(31, 31, 31, 0.2) 100%)'
                    }}>
                        <div className="border-b p-4" style={{ borderColor: '#404040' }}>
                            <div className="space-y-2">
                                {notes.map(note => (
                                    <div
                                        key={note._id}
                                        onClick={() => setSelectedNoteId(note._id)}
                                        className={`px-4 py-3 rounded-2xl cursor-pointer flex items-center justify-between group transition-all duration-200 ${selectedNoteId === note._id
                                            ? 'text-white'
                                            : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                        style={{
                                            background: selectedNoteId === note._id
                                                ? 'linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)'
                                                : 'transparent',
                                            border: selectedNoteId === note._id
                                                ? '1px solid #404040'
                                                : 'none',
                                            boxShadow: selectedNoteId === note._id
                                                ? '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                                : 'none'
                                        }}
                                    >
                                        <p className="text-sm font-medium truncate flex-1">{note.title}</p>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRenameNote(note._id, note.title);
                                                }}
                                                className="text-xs text-gray-400 hover:text-blue-300 transition-colors px-2 py-1"
                                                title={t('notes.rename')}
                                            >
                                                {t('notes.rename')}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNote(note._id);
                                                }}
                                                className="text-xs text-gray-400 hover:text-red-300 transition-colors px-2 py-1"
                                                title={t('notes.delete')}
                                            >
                                                {t('notes.delete')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleAddNote}
                                className="w-full  py-3 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors rounded-2xl hover:bg-white/5"
                            >
                                + {t('notes.newNote')}
                            </button>
                        </div>

                        {selectedNote && (
                            <>
                                <div className="px-6 py-4 border-b" style={{ borderColor: '#404040' }}>
                                    <input
                                        type="text"
                                        value={selectedNote.title}
                                        onChange={(e) => handleUpdateNote(selectedNote._id, 'title', e.target.value)}
                                        className="w-full text-lg font-semibold bg-transparent border-0 focus:outline-none px-0"
                                        placeholder={t('notes.untitled')}
                                        style={{ color: '#ffffff' }}
                                    />
                                </div>

                                <div className="px-6 py-4 flex-1 overflow-hidden">
                                    <div className="h-full">
                                        <ReactQuill
                                            key={selectedNote._id}
                                            value={selectedNote.content || ''}
                                            onChange={(content) => handleUpdateNote(selectedNote._id, 'content', content)}
                                            modules={quillModules}
                                            formats={quillFormats}
                                            theme="snow"
                                            placeholder={t('notes.startWriting')}
                                            style={{ height: '500px', display: 'flex', flexDirection: 'column' }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotesPanel;