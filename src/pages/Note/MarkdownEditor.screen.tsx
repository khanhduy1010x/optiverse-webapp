import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/note/MarkdownEditor.style.css';
import { setShowWarningModal } from '../../store/slices/ui.slice';
import { formatDateTimeFull } from '../../utils/date.utils';
import ToolBarNote from './ToolbarNote.screen';
import Icon from '../../components/common/Icon/Icon.component';
import { useMarkdownEditor } from '../../hooks/note/useMarkdownEditor.hook';

const MarkdownEditor: React.FC = () => {
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
    handleFormatAI,
    handleAccept,
    handleReject,
    dispatch
  } = useMarkdownEditor();

  // Theo dõi trạng thái của ignoreValuePropUpdate
  const [shouldIgnoreValue, setShouldIgnoreValue] = useState(false);

  // Cập nhật state shouldIgnoreValue khi ignoreValuePropUpdate.current thay đổi
  useEffect(() => {
    const checkIgnoreProp = () => {
      if (quillRef.current && 'ignoreValuePropUpdate' in quillRef.current) {
        const ignoreValue = (quillRef.current as any).ignoreValuePropUpdate?.current;
        setShouldIgnoreValue(!!ignoreValue);
      }
    };

    // Kiểm tra ban đầu
    checkIgnoreProp();

    // Kiểm tra định kỳ
    const interval = setInterval(checkIgnoreProp, 100);

    return () => clearInterval(interval);
  }, [quillRef]);

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
                <div className="bg-blue-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
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

  return (
    <div className="flex w-full flex-col h-full relative">
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {currentNote?.title || 'No note selected'}
          </h1>
          <div className="flex justify-center items-center text-sm text-gray-500">
            {currentNote?.updatedAt && (
              <span>Last saved: {formatDateTimeFull(currentNote.updatedAt)}</span>
            )}
            {typingUsers.size > 0 && (
              <span className="ml-3 text-blue-500 animate-pulse">
                {typingUsers.size === 1 ? 'Someone is typing...' : `${typingUsers.size} people are typing...`}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="px-4 py-2 bg-blue-600 cursor-pointer disabled:cursor-not-allowed flex items-center justify-between gap-1 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-400 transition-all duration-150"
            onClick={handleFormatAI}
            disabled={isFormatting || showAcceptReject || !currentNote?.content.trim()}
          >
            AI Formatter <Icon name='blinkAI' />
          </button>
          {showAcceptReject && (
            <>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                onClick={handleAccept}
              >
                Accept
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                onClick={handleReject}
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
      {isFormatting && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
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
            className="flex-1 markdown-editor"
            theme="snow"
            modules={{
              history: {
                delay: 1000,
                maxStack: 100,
                userOnly: false,
              },
              toolbar: false,
            }}
            readOnly={isFormatting}
            formats={[
              'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
              'list', 'bullet', 'indent', 'link', 'image', 'color', 'background',
              'align', 'code-block', 'script'
            ]}
            scrollingContainer=".quill-wrapper"
          />
        </div>
      </div>

      <ToolBarNote onAction={handleAction} formatState={formatState} />

      {showWarningModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Warning</h2>
            <p className="text-gray-700 mb-6">
              You are viewing an AI-formatted preview. Please choose Accept or Reject before switching to another note.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
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
