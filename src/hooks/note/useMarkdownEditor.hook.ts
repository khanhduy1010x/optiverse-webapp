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

    // Lưu vị trí hiện tại của con trỏ
    const currentRange = { ...range };

    // Tạm thời vô hiệu hóa việc cập nhật formatState từ selection-change
    isUpdatingRef.current = true;

    // Thực hiện định dạng
    let newFormatState = { ...formatState };

    switch (action) {
      case 'bold':
        quill.format('bold', !formatState.bold);
        newFormatState.bold = !formatState.bold;
        break;
      case 'italic':
        quill.format('italic', !formatState.italic);
        newFormatState.italic = !formatState.italic;
        break;
      case 'title':
        quill.format('header', formatState.header ? false : 1);
        newFormatState.header = !formatState.header;
        break;
      case 'strike':
        quill.format('strike', !formatState.strike);
        newFormatState.strike = !formatState.strike;
        break;
      case 'clear-format':
        quill.removeFormat(range.index, range.length);
        newFormatState = {
          bold: false,
          italic: false,
          header: false,
          strike: false,
        };
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

    // Cập nhật formatState
    setFormatState(newFormatState);

    // Cập nhật nội dung
    if (currentNote) {
      const content = quill.root.innerHTML;
      const processedContent = preserveTrailingSpaces(content);
      dispatch(updateCurrentNoteContent(processedContent));
      SocketService.updateNoteImmediate(processedContent);
    }

    // Khôi phục vị trí con trỏ và cho phép cập nhật formatState từ selection-change
    requestAnimationFrame(() => {
      quill.setSelection(currentRange.index, currentRange.length);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    });
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

  // Biến để kiểm tra trạng thái cập nhật
  const isUpdatingRef = useRef(false);

  // Cập nhật trạng thái định dạng khi vùng chọn thay đổi
  useEffect(() => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();

    // Hàm cập nhật trạng thái định dạng hiện tại
    const updateFormatState = () => {
      if (!quill || isUpdatingRef.current) return;

      const selection = quill.getSelection();
      if (!selection) return;

      isUpdatingRef.current = true;

      try {
        const format = quill.getFormat(selection);
        setFormatState({
          bold: !!format.bold,
          italic: !!format.italic,
          header: !!format.header,
          strike: !!format.strike,
        });
      } finally {
        // Đảm bảo reset cờ ngay cả khi có lỗi xảy ra
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    };

    // Chỉ lắng nghe sự kiện thay đổi vùng chọn
    quill.on('selection-change', updateFormatState);

    // Cập nhật trạng thái ban đầu sau một khoảng thời gian nhỏ
    setTimeout(updateFormatState, 50);

    return () => {
      quill.off('selection-change', updateFormatState);
    };
  }, [quillRef.current, currentNote]);

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
