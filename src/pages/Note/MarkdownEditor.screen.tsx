import React from 'react';
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
    handleChange,
    handleAction,
    handleFormatAI,
    handleAccept,
    handleReject,
    dispatch
  } = useMarkdownEditor();

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
            value={showAcceptReject && aiContent !== null ? aiContent : currentNote?.content || ''}
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
