import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../styles/note/MarkdownEditor.style.css';
import { setShowWarningModal } from '../../store/slices/ui.slice';
import { formatDateTimeFull } from '../../utils/date.utils';
import ToolBarNote from './ToolbarNote.screen';
import { useMarkdownEditor } from '../../hooks/note/useMarkdownEditor.hook';
import { useTranslation } from 'react-i18next';
import { MarkdownEditorProps } from '../../types/note/props/component.props';
import Icon from '../../components/common/Icon/Icon.component';

const quillModules = {
  toolbar: false
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

// Add custom CSS to fix text color
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

  @media print {
    body,
    .markdown-editor,
    .markdown-editor .ql-container,
    .markdown-editor .ql-editor,
    .markdown-editor .ql-editor *,
    .markdown-editor .ql-editor p,
    .markdown-editor .ql-editor span,
    .markdown-editor .ql-editor div {
      background: #fff !important;
      background-color: #fff !important;
      color: #000 !important;
    }
    
    .markdown-editor .ql-editor h1,
    .markdown-editor .ql-editor h2,
    .markdown-editor .ql-editor h3,
    .markdown-editor .ql-editor h4,
    .markdown-editor .ql-editor h5,
    .markdown-editor .ql-editor h6 {
      color: #000 !important;
    }

    .markdown-editor .ql-editor pre,
    .markdown-editor .ql-editor code {
      background: #f5f5f5 !important;
      color: #000 !important;
    }
  }
`;

const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
  const {
    quillRef,
    currentNote,
    formatState,
    typingUsers,
    isFormatting,
    showAcceptReject,
    showWarningModal,
    aiContent,
    isNoteDeleted,
    handleChange,
    handleAction,
    handleAccept,
    handleReject,
    dispatch,
    exportToPDF
  } = useMarkdownEditor();

  const { t } = useTranslation();

  const [shouldIgnoreValue, setShouldIgnoreValue] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const hasEditPermission = !currentNote?.permission || currentNote?.permission === 'edit';

  useEffect(() => {
    const checkIgnoreProp = () => {
      if (quillRef.current && 'ignoreValuePropUpdate' in quillRef.current) {
        const ignoreValue = (quillRef.current as any).ignoreValuePropUpdate?.current;
        setShouldIgnoreValue(!!ignoreValue);
      }
    };

    checkIgnoreProp();

    const interval = setInterval(checkIgnoreProp, 100);

    return () => clearInterval(interval);
  }, [quillRef]);

  useEffect(() => {
    // Add editor text color styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = editorStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportToPDF();
    } finally {
      setIsExporting(false);
    }
  };

  if (isNoteDeleted || !currentNote) {
    return (
      <div className="flex w-full flex-col h-full relative">
        <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isNoteDeleted ? 'Note Deleted' : 'No Note Selected'}
            </h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            {isNoteDeleted ? (
              <>
                <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Note Deleted</h2>
                <p className="text-gray-600 mb-4">
                  This note has been deleted by another user. Please select or create another note.
                </p>
              </>
            ) : (
              <>
                <div className="bg-[#21b4ca] rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#e6f7f9" stroke="currentColor" strokeWidth="2" className="text-[#e6f7f9]">
                    <path d="M16 18l2-2m0 0l-2-2m2 2l-2 2m2-2l2 2M4 6h16M4 12h9" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Note Selected</h2>
                <p className="text-gray-600 mb-4">
                  Please select a note from the list or create a new one to get started.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isReadOnly = currentNote.permission === 'view' || isNoteDeleted;

  return (
    <div className="flex w-full flex-col h-full relative">
      <div className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#f8fdfe] to-white">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="mr-2">{currentNote?.title || 'No note selected'}</span>
              {!hasEditPermission && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium">
                  View only
                </span>
              )}
            </h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              {currentNote?.updatedAt && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-[#21b4ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Last saved: {formatDateTimeFull(currentNote.updatedAt)}</span>
                </div>
              )}

              {typingUsers.size > 0 && (
                <span className="ml-4 text-[#21b4ca] animate-pulse flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  {typingUsers.size === 1 ? 'Someone is typing...' : `${typingUsers.size} people are typing...`}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={handleExportPDF}
              disabled={isExporting || !currentNote}
              className="px-3 py-1.5 bg-[#21b4ca] text-white rounded-lg font-medium hover:bg-[#1a9db0] flex items-center gap-1.5 transition-all shadow-sm"
              title="Export to PDF"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <button className="flex items-center gap-1.5 cursor-pointer" >
                  <Icon name="pdf" size={16} className="text-[#21b4ca]" />
                  <span>Export PDF</span>
                </button>
              )}
            </button>

            {showAcceptReject && hasEditPermission && (
              <>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm"
                  onClick={handleAccept}
                >
                  Accept
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 shadow-sm"
                  onClick={handleReject}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>

        {hasEditPermission && (
          <div className="border-t border-gray-100">
            <ToolBarNote onAction={handleAction} formatState={formatState} />
          </div>
        )}
      </div>

      {isFormatting && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#21b4ca] border-t-transparent mb-4"></div>
            <span className="text-lg font-semibold text-gray-700">Formatting with AI...</span>
          </div>
        </div>
      )}

      <div className="quill-wrapper">
        <div className="relative">
          <ReactQuill
            ref={quillRef}
            value={shouldIgnoreValue ? undefined : (showAcceptReject && aiContent !== null ? aiContent : currentNote?.content || '')}
            onChange={handleChange}
            className="flex-1 markdown-editor custom-scrollbar-1"
            theme="snow"
            modules={quillModules}
            formats={quillFormats}
            readOnly={isReadOnly}
            scrollingContainer=".quill-wrapper"
          />
          {!hasEditPermission && (
            <div className="absolute bottom-4 left-4 right-4 bg-yellow-50 border border-yellow-200 p-3 rounded-lg shadow-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-yellow-700">You only have view permission for this note. Contact the person who shared it to request edit access.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Warning</h2>
            <p className="text-gray-700 mb-6">
              You are viewing an AI-formatted preview. Please choose Accept or Reject before switching to another note.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-[#21b4ca] text-white rounded-lg font-medium hover:bg-[#1a8fa3]"
                onClick={() => dispatch(setShowWarningModal(false))}
              >
                OK
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                onClick={() => dispatch(setShowWarningModal(false))}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
