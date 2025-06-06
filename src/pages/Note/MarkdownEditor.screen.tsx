import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './MarkdownEditor.css';
import { RootState } from '../../store';
import { setCurrentNote } from '../../store/slices/items.slice';
import { setShowWarningModal } from '../../store/slices/ui.slice';
import { formatDateTimeFull } from '../../utils/date.utils';
import ToolBarNote from './ToolbarNote.screen';
import Icon from '../../components/common/Icon/Icon.component';
import { NoteService } from '../../services/note.service';
import SocketService from '../../services/socket.service';

const cleanGeminiHtml = (raw: string) => {
  let cleaned = raw.replace(/<pre><code>/g, '<pre class="ql-syntax" spellcheck="false">');
  cleaned = cleaned.replace(/<\/code><\/pre>/g, '</pre>');
  return cleaned;
};

const MarkdownEditor: React.FC = () => {
  const dispatch = useDispatch();
  const quillRef = useRef<ReactQuill | null>(null);
  const skipNextOnChange = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const { currentNote } = useSelector((state: RootState) => state.items);
  const { showWarningModal } = useSelector((state: RootState) => state.ui);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    header: false,
    strike: false
  });
  const [typingUsers] = useState<Set<string>>(new Set());
  const [isFormatting, setIsFormatting] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [oldContent, setOldContent] = useState<string | null>(null);
  const [showAcceptReject, setShowAcceptReject] = useState(false);

  useEffect(() => {
    const currentNoteId = currentNote?._id;
    if (currentNoteId) {
      SocketService.joinNote(currentNoteId);
    }
    return () => {
      if (currentNoteId) {
        SocketService.leaveNote(currentNoteId);
      }
    };
  }, [currentNote?._id]);

  const handleNoteUpdate = (data: any) => {
    if (!currentNote || data.noteId !== currentNote._id || !quillRef.current || showAcceptReject)
      return;

    if (data.content !== currentNote.content) {
      skipNextOnChange.current = true;
      dispatch(
        setCurrentNote({
          ...currentNote,
          content: data.content,
        })
      );

      const quill = quillRef.current.getEditor();
      quill.setContents(quill.clipboard.convert(data.content));
    }
  };

  const handleNoteError = (data: any) => {
    if (currentNote && data.noteId === currentNote._id) {
      console.error('Note error:', data.error);
    }
  };

  const handleTyping = (data: any) => {
    if (currentNote && data.noteId === currentNote._id && data.userId !== SocketService.getUserId()) {
      typingUsers.add(data.userId);
      setFormatState({ ...formatState });
    }
  };

  const handleStopTyping = (data: any) => {
    if (currentNote && data.noteId === currentNote._id) {
      typingUsers.delete(data.userId);
      setFormatState({ ...formatState });
    }
  };

  useEffect(() => {
    SocketService.on('note_update', handleNoteUpdate);
    SocketService.on('note_error', handleNoteError);
    SocketService.on('typing', handleTyping);
    SocketService.on('stop_typing', handleStopTyping);

    return () => {
      SocketService.off('note_update', handleNoteUpdate);
      SocketService.off('note_error', handleNoteError);
      SocketService.off('typing', handleTyping);
      SocketService.off('stop_typing', handleStopTyping);
    };
  }, [currentNote, formatState, showAcceptReject]);

  const preserveTrailingSpaces = (content: string): string => {
    if (
      content.endsWith('&#8203;') ||
      content.endsWith('\u200B') ||
      content.endsWith('&nbsp;') ||
      content.endsWith('\u00A0')
    ) {
      return content;
    }

    const lastChar = content.charAt(content.length - 1);
    if (lastChar === ' ') {
      return content + '&nbsp;';
    } else if (lastChar === '\n') {
      return content + '&#8203;';
    }

    return content;
  };

  const handleChange = (content: string, delta: any, source: string) => {
    if (skipNextOnChange.current) {
      skipNextOnChange.current = false;
      return;
    }

    if (source !== 'user' || !currentNote) return;

    const processedContent = preserveTrailingSpaces(content);

    dispatch(
      setCurrentNote({
        ...currentNote,
        content: processedContent,
      })
    );

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      SocketService.updateNote(processedContent);
      debounceTimeout.current = null;
    }, 300);
  };

  const handleAction = (action: string) => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (!range) return;

    switch (action) {
      case 'bold':
        quill.format('bold', !formatState.bold);
        break;
      case 'italic':
        quill.format('italic', !formatState.italic);
        break;
      case 'title':
        quill.format('header', formatState.header ? false : 1);
        break;
      case 'strike':
        quill.format('strike', !formatState.strike);
        break;
      case 'clear-format':
        quill.removeFormat(range.index, range.length);
        break;
      case 'list-dot':
        quill.format('list', quill.getFormat().list === 'bullet' ? false : 'bullet');
        break;
      case 'list-number':
        quill.format('list', quill.getFormat().list === 'ordered' ? false : 'ordered');
        break;
      case 'undo':
        quill.history.undo();
        break;
      case 'redo':
        quill.history.redo();
        break;
      default:
        break;
    }

    setTimeout(() => {
      quill.setSelection(range.index, range.length);

      if (currentNote) {
        const content = quill.root.innerHTML;
        const processedContent = preserveTrailingSpaces(content);
        dispatch(setCurrentNote({ ...currentNote, content: processedContent }));
        SocketService.updateNoteImmediate(processedContent);
      }
    }, 0);
  };

  const handleFormatAI = async () => {
    if (!currentNote) return;
    if (currentNote.content.trim() === '') return;
    setIsFormatting(true);
    setOldContent(currentNote.content || '');
    setShowAcceptReject(false);
    try {
      let formatted = await NoteService.formatNoteWithGemini(currentNote.content || '');
      formatted = cleanGeminiHtml(formatted);
      setAiContent(formatted);
      setShowAcceptReject(true);

      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        skipNextOnChange.current = true;
        quill.setContents(quill.clipboard.convert(formatted));
      }
    } catch (e) {
      alert('AI Formatting failed!');
    } finally {
      setIsFormatting(false);
    }
  };

  const handleAccept = () => {
    if (aiContent && currentNote) {
      dispatch(setCurrentNote({ ...currentNote, content: aiContent }));
      SocketService.updateNoteImmediate(aiContent);
      setShowAcceptReject(false);
      setAiContent(null);
      setOldContent(null);
    }
  };

  const handleReject = () => {
    if (oldContent && currentNote && quillRef.current) {
      const quill = quillRef.current.getEditor();
      skipNextOnChange.current = true;
      quill.setContents(quill.clipboard.convert(oldContent));
      dispatch(setCurrentNote({ ...currentNote, content: oldContent }));
    }
    setShowAcceptReject(false);
    setAiContent(null);
    setOldContent(null);
  };

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
