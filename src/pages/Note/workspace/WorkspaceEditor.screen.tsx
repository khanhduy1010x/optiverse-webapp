import React, { useEffect, useState, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../../styles/note/MarkdownEditor.style.css';
import { formatDateTimeShort, formatDateTimeFull } from '../../../utils/date.utils';
import Icon from '../../../components/common/Icon/Icon.component';

const getQuillModules = (canEdit: boolean) => {
    if (!canEdit) {
        return { toolbar: false };
    }
    return {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ]
    };
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent',
    'direction',
    'size',
    'color', 'background',
    'font',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'highlight'
];

const editorStyles = `
  .markdown-editor .ql-editor {
    color: #1f2937 !important;
  }
  
  .markdown-editor .ql-editor.ql-blank::before {
    color: #9ca3af;
    font-style: italic;
  }
  
  .markdown-editor .ql-editor p {
    color: #1f2937;
  }
`;

export interface RootItem {
    _id: string;
    name?: string;
    title?: string;
    type: 'folder' | 'file';
    updatedAt: string;
    subfolders?: RootItem[];
    files?: RootItem[];
    isShared?: boolean;
    permission?: 'view' | 'edit';
    owner_info?: { id: string; name: string };
}

interface WorkspaceEditorProps {
    selectedItem: RootItem | null;
    selectedNote?: RootItem | null; // Separate state for edited note
    onDelete: () => void;
    canEdit?: boolean;
    onNoteUpdate?: (noteId: string, content: string) => void;
    noteContent?: string; // Real-time content from other users
}

const WorkspaceEditor: React.FC<WorkspaceEditorProps> = ({
    selectedItem,
    selectedNote,
    onDelete,
    canEdit = false,
    onNoteUpdate,
    noteContent = ''
}) => {
    const quillRef = React.useRef<ReactQuill>(null);
    const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [content, setContent] = useState('');

    useEffect(() => {
        // Add editor text color styles
        const styleElement = document.createElement('style');
        styleElement.innerHTML = editorStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    useEffect(() => {
        if (!selectedNote) {
            setContent('');
        }
    }, [selectedNote]);

    const handleEditorChange = (newContent: string) => {
        setContent(newContent);

        // Debounce WebSocket update to avoid spamming (300ms)
        if (canEdit && selectedNote?.type === 'file' && onNoteUpdate) {
            // Clear existing timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // Set new timeout for debounced emit
            debounceTimeoutRef.current = setTimeout(() => {
                onNoteUpdate(selectedNote._id, newContent);
            }, 300);
        }
    };

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    // Sync real-time content updates from other users (only if not currently editing)
    useEffect(() => {
        if (noteContent && noteContent !== content) {
            setContent(noteContent);
        }
    }, [noteContent]);

    const handleExportPDF = async () => {
        if (isExporting || !selectedItem) return;
        setIsExporting(true);
        try {
            // TODO: Implement PDF export
            console.log('Exporting to PDF:', selectedItem.title);
        } finally {
            setIsExporting(false);
        }
    };
    if (!selectedNote) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="bg-[#21b4ca] rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="#e6f7f9" stroke="currentColor" strokeWidth="2" className="text-[#e6f7f9]">
                            <path d="M16 18l2-2m0 0l-2-2m2 2l-2 2m2-2l2 2M4 6h16M4 12h9" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Note Selected</h2>
                    <p className="text-gray-600 mb-4">Please select a note from the list to view or edit it.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#f8fdfe] to-white">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
                            <span className="mr-2">
                                {selectedNote.title}
                            </span>
                        </h1>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <svg className="w-4 h-4 mr-1 text-[#21b4ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>Last updated: {formatDateTimeFull(selectedNote.updatedAt || '')}</span>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="px-3 py-1.5 bg-[#21b4ca] text-white rounded-lg font-medium hover:bg-[#1a9db0] flex items-center gap-1.5 transition-all shadow-sm"
                            title="Export to PDF"
                        >
                            {isExporting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="pdf" size={16} />
                                    <span>Export PDF</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all shadow-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Note editor view */}
            <div className="quill-wrapper">
                <div className="relative">
                    <ReactQuill
                        ref={quillRef}
                        value={content}
                        onChange={handleEditorChange}
                        className="flex-1 markdown-editor custom-scrollbar-1"
                        theme="snow"
                        modules={getQuillModules(canEdit)}
                        formats={quillFormats}
                        readOnly={!canEdit}
                    />
                    {!canEdit && (
                        <div className="absolute bottom-4 left-4 right-4 bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-md">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-blue-700">
                                    {selectedNote?.permission === 'view'
                                        ? 'You have view-only permission for this note'
                                        : 'No edit permission'}
                                </span>
                            </div>
                        </div>
                    )}
                    {canEdit && (
                        <div className="absolute bottom-4 left-4 right-4 bg-green-50 border border-green-200 p-3 rounded-lg shadow-md">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-green-700">You can edit this note - changes sync in real-time</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkspaceEditor;
