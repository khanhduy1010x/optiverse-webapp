import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { RootState, AppDispatch } from '../../store';
import {
  setCurrentNote,
  updateCurrentNoteContent,
  fetchItems,
} from '../../store/slices/items.slice';
import { setShowWarningModal } from '../../store/slices/ui.slice';
import noteService from '../../services/note.service';
import SocketService from '../../services/socket.service';
import ReactQuill, { Quill } from 'react-quill';
import { toast } from 'react-toastify';
const Delta = Quill.import('delta');

const cleanGeminiHtml = (raw: string) => {
  let cleaned = raw.replace(
    /<pre><code>/g,
    '<pre class="ql-syntax" spellcheck="false">'
  );
  cleaned = cleaned.replace(/<\/code><\/pre>/g, '</pre>');
  return cleaned;
};

export const useMarkdownEditor = () => {
  const dispatch = useDispatch<AppDispatch>();
  const quillRef = useRef<ReactQuill | null>(null);
  const skipNextOnChange = useRef(false);
  const ignoreValuePropUpdate = useRef(false);
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
  const [isNoteDeleted, setIsNoteDeleted] = useState(false);

  useEffect(() => {
    const currentNoteId = currentNote?._id;
    if (currentNoteId) {
      SocketService.joinNote(currentNoteId);
      setIsNoteDeleted(false);
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
      ignoreValuePropUpdate.current = true;

      dispatch(updateCurrentNoteContent(data.content));

      const quill = quillRef.current.getEditor();
      const selection = quill.getSelection();

      const contentDelta = quill.clipboard.convert(data.content);
      const currentLength = quill.getLength();
      const updateDelta = new Delta()
        .delete(currentLength)
        .concat(contentDelta);

      quill.updateContents(updateDelta, 'api');

      if (selection) {
        setTimeout(() => {
          const newLength = quill.getLength();
          const safeIndex = Math.min(selection.index, newLength - 1);
          quill.setSelection(safeIndex, 0);
        }, 1);
      }

      setTimeout(() => {
        ignoreValuePropUpdate.current = false;
      }, 10);
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

  const handleNoteDeleted = (data: any) => {
    if (currentNote && data.noteId === currentNote._id) {
      setIsNoteDeleted(true);

      toast.error('The current note has been deleted by another user', {
        autoClose: false,
        closeOnClick: false,
        position: 'top-center',
      });

      dispatch(setCurrentNote(null));
    }
  };

  const handleNoteRenamed = (data: any) => {
    if (currentNote && data.noteId === currentNote._id) {
      dispatch(
        setCurrentNote({
          ...currentNote,
          title: data.newTitle,
        })
      );

      toast.info(
        `The note has been renamed to "${data.newTitle}" by another user`
      );
    }
  };

  const handleFolderDeleted = (data: any) => {
    if (currentNote && currentNote.folder_id === data.folderId) {
      setIsNoteDeleted(true);

      toast.error(
        'The folder containing this note has been deleted by another user',
        {
          autoClose: false,
          closeOnClick: false,
          position: 'top-center',
        }
      );

      dispatch(setCurrentNote(null));
    }
  };

  const handleFolderStructureChanged = () => {
    console.log('Folder structure was changed, fetching updated items');

    dispatch(fetchItems());

    toast.info('Folder structure has been updated');
  };

  useEffect(() => {
    SocketService.on('note_update', handleNoteUpdate);
    SocketService.on('note_error', handleNoteError);
    SocketService.on('typing', handleTyping);
    SocketService.on('stop_typing', handleStopTyping);
    SocketService.on('note_deleted', handleNoteDeleted);
    SocketService.on('note_renamed', handleNoteRenamed);
    SocketService.on('folder_deleted', handleFolderDeleted);
    SocketService.on('folder_structure_changed', handleFolderStructureChanged);

    return () => {
      SocketService.off('note_update', handleNoteUpdate);
      SocketService.off('note_error', handleNoteError);
      SocketService.off('typing', handleTyping);
      SocketService.off('stop_typing', handleStopTyping);
      SocketService.off('note_deleted', handleNoteDeleted);
      SocketService.off('note_renamed', handleNoteRenamed);
      SocketService.off('folder_deleted', handleFolderDeleted);
      SocketService.off(
        'folder_structure_changed',
        handleFolderStructureChanged
      );
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
    if (isNoteDeleted) {
      toast.error('Không thể chỉnh sửa: ghi chú này đã bị xóa', {
        position: 'top-center',
      });
      return;
    }

    if (skipNextOnChange.current) {
      skipNextOnChange.current = false;
      return;
    }

    if (source !== 'user' || !currentNote) return;

    const processedContent = preserveTrailingSpaces(content);

    dispatch(updateCurrentNoteContent(processedContent));

    SocketService.updateNoteImmediate(processedContent);
  };

  const handleAction = (action: string) => {
    console.log(`Action triggered: ${action}`);
    console.log(
      `Current formatState before action: `,
      JSON.stringify(formatState)
    );

    if (isNoteDeleted) {
      toast.error('Không thể chỉnh sửa: ghi chú này đã bị xóa', {
        position: 'top-center',
      });
      return;
    }

    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (!range) return;

    // Lấy format hiện tại tại vị trí con trỏ để đảm bảo các thao tác toggle chính xác
    const currentFormat =
      range.length > 0
        ? quill.getFormat(range)
        : quill.getFormat(range.index, 1);
    console.log(`Current format from Quill: ${JSON.stringify(currentFormat)}`);

    switch (action) {
      case 'bold':
        console.log(
          `Toggling bold from ${!!currentFormat.bold} to ${!currentFormat.bold}`
        );
        quill.format('bold', !currentFormat.bold);
        setFormatState(prev => {
          const newState = { ...prev, bold: !currentFormat.bold };
          console.log('New formatState after bold toggle:', newState);
          return newState;
        });
        break;
      case 'italic':
        console.log(
          `Toggling italic from ${!!currentFormat.italic} to ${!currentFormat.italic}`
        );
        quill.format('italic', !currentFormat.italic);
        setFormatState(prev => {
          const newState = { ...prev, italic: !currentFormat.italic };
          console.log('New formatState after italic toggle:', newState);
          return newState;
        });
        break;
      case 'title':
        console.log(
          `Toggling header from ${!!currentFormat.header} to ${!currentFormat.header}`
        );
        quill.format('header', currentFormat.header ? false : 1);
        setFormatState(prev => {
          const newState = { ...prev, header: !currentFormat.header };
          console.log('New formatState after header toggle:', newState);
          return newState;
        });
        break;
      case 'strike':
        console.log(
          `Toggling strike from ${!!currentFormat.strike} to ${!currentFormat.strike}`
        );
        quill.format('strike', !currentFormat.strike);
        setFormatState(prev => {
          const newState = { ...prev, strike: !currentFormat.strike };
          console.log('New formatState after strike toggle:', newState);
          return newState;
        });
        break;
      case 'clear-format':
        console.log('Clearing format for selection');
        quill.removeFormat(range.index, range.length);
        setFormatState(prev => {
          const newState = {
            bold: false,
            italic: false,
            header: false,
            strike: false,
          };
          console.log(
            'New formatState after clearing format:',
            JSON.stringify(newState)
          );
          return newState;
        });
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
        dispatch(updateCurrentNoteContent(processedContent));
        SocketService.updateNoteImmediate(processedContent);
      }
    }, 0);
  };

  const handleFormatAI = async () => {
    if (isNoteDeleted) {
      toast.error('Không thể định dạng: ghi chú này đã bị xóa', {
        position: 'top-center',
      });
      return;
    }

    if (!currentNote) return;
    if (currentNote.content.trim() === '') return;
    setIsFormatting(true);
    setOldContent(currentNote.content || '');
    setShowAcceptReject(false);
    try {
      let formatted = await noteService.formatNoteWithGemini(
        currentNote.content || ''
      );
      formatted = cleanGeminiHtml(formatted);
      setAiContent(formatted);
      setShowAcceptReject(true);

      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        skipNextOnChange.current = true;

        const contentDelta = quill.clipboard.convert(formatted);
        const currentLength = quill.getLength();
        const updateDelta = new Delta()
          .delete(currentLength)
          .concat(contentDelta);

        quill.updateContents(updateDelta, 'api');
      }
    } catch (e) {
      toast.error('AI Formatting failed!');
    } finally {
      setIsFormatting(false);
    }
  };

  const handleAccept = () => {
    if (aiContent && currentNote) {
      dispatch(updateCurrentNoteContent(aiContent));
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

      const contentDelta = quill.clipboard.convert(oldContent);
      const currentLength = quill.getLength();
      const updateDelta = new Delta()
        .delete(currentLength)
        .concat(contentDelta);

      quill.updateContents(updateDelta, 'api');

      dispatch(updateCurrentNoteContent(oldContent));
    }
    setShowAcceptReject(false);
    setAiContent(null);
    setOldContent(null);
  };

  // Cập nhật trạng thái định dạng khi selection thay đổi
  useEffect(() => {
    if (!quillRef.current) return;

    console.log('useEffect formatState setup', formatState);

    const quill = quillRef.current.getEditor();

    // Hàm cập nhật trạng thái định dạng
    const updateFormat = (range: { index: number; length: number } | null) => {
      if (!range) {
        console.log('No selection, keeping current format state');
        return;
      }

      try {
        // Lấy định dạng tại vị trí con trỏ
        // Nếu có selection với length > 0, sử dụng range
        // Nếu chỉ là con trỏ (length = 0), sử dụng vị trí con trỏ
        const format =
          range.length > 0
            ? quill.getFormat(range)
            : quill.getFormat(range.index, 1);

        console.log('Format from Quill (detailed):', JSON.stringify(format));

        const newFormatState = {
          bold: !!format.bold,
          italic: !!format.italic,
          header: !!format.header,
          strike: !!format.strike,
        };

        console.log('New format detailed:', JSON.stringify(newFormatState));

        // Cập nhật state ngay lập tức nếu có sự thay đổi
        setFormatState(prevState => {
          const isDifferent =
            JSON.stringify(newFormatState) !== JSON.stringify(prevState);
          console.log('Format changed:', isDifferent);

          if (isDifferent) {
            return newFormatState;
          }
          return prevState;
        });
      } catch (error) {
        console.error('Error getting format:', error);
      }
    };

    // Lắng nghe sự kiện selection-change
    quill.on('selection-change', updateFormat);

    // Lắng nghe sự kiện text-change để cập nhật format khi text thay đổi
    const textChangeHandler = () => {
      const range = quill.getSelection();
      if (range) {
        updateFormat(range);
      }
    };
    quill.on('text-change', textChangeHandler);

    // Thực hiện update format ban đầu nếu đã có selection
    const initialSelection = quill.getSelection();
    if (initialSelection) {
      updateFormat(initialSelection);
    }

    return () => {
      console.log('Removing Quill event listeners');
      quill.off('selection-change', updateFormat);
      quill.off('text-change', textChangeHandler);
    };
  }, [quillRef.current]);

  return {
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
    dispatch,
  };
};
