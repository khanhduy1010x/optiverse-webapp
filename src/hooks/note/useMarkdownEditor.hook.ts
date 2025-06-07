import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCurrentNote } from '../../store/slices/items.slice';
import { setShowWarningModal } from '../../store/slices/ui.slice';
import { NoteService } from '../../services/note.service';
import SocketService from '../../services/socket.service';
import ReactQuill from 'react-quill';

const cleanGeminiHtml = (raw: string) => {
  let cleaned = raw.replace(
    /<pre><code>/g,
    '<pre class="ql-syntax" spellcheck="false">'
  );
  cleaned = cleaned.replace(/<\/code><\/pre>/g, '</pre>');
  return cleaned;
};

export const useMarkdownEditor = () => {
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
    strike: false,
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
    if (
      !currentNote ||
      data.noteId !== currentNote._id ||
      !quillRef.current ||
      showAcceptReject
    )
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
    if (
      currentNote &&
      data.noteId === currentNote._id &&
      data.userId !== SocketService.getUserId()
    ) {
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
        quill.format(
          'list',
          quill.getFormat().list === 'bullet' ? false : 'bullet'
        );
        break;
      case 'list-number':
        quill.format(
          'list',
          quill.getFormat().list === 'ordered' ? false : 'ordered'
        );
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
      let formatted = await NoteService.formatNoteWithGemini(
        currentNote.content || ''
      );
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

  return {
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
    dispatch,
  };
};
