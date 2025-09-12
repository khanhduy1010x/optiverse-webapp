import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setCurrentNote,
  updateCurrentNoteContent,
  fetchItems,
} from '../../store/slices/items.slice';
import noteService from '../../services/note.service';
import SocketService from '../../services/socket.service';
import ReactQuill, { Quill } from 'react-quill-new';
import { toast } from 'react-toastify';

const Delta = Quill.import('delta');

const Inline = Quill.import('blots/inline');

class HighlightBlot extends Inline {
  static create(value: string): HTMLElement {
    let node = super.create();
    node.setAttribute('style', `background-color: ${value}`);
    return node;
  }

  static value(node: HTMLElement): string {
    return node.getAttribute('style')?.split('background-color: ')[1] || '';
  }
}
HighlightBlot.blotName = 'highlight';
HighlightBlot.tagName = 'mark';
Quill.register('formats/highlight', HighlightBlot);

const AlignClass = Quill.import('attributors/class/align');
Quill.register(AlignClass, true);

const FontClass = Quill.import('attributors/class/font');
Quill.register(FontClass, true);

const SizeClass = Quill.import('attributors/class/size');
Quill.register(SizeClass, true);

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
    underline: false,
    list: '',
    script: '',
    indent: 0,
    direction: '',
    size: '',
    color: '',
    background: '',
    font: '',
    align: '',
    blockquote: false,
    codeBlock: false,
    highlight: false,
    link: false,
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
    }
  };

  const handleFolderDeleted = (data: any) => {
    if (currentNote && currentNote.folder_id === data.folderId) {
      setIsNoteDeleted(true);

      dispatch(setCurrentNote(null));
    }
  };

  const handleFolderStructureChanged = (data: {
    eventType?: 'my_note' | 'shared_note';
    isSharedView?: boolean;
  }) => {
    if (data?.eventType === 'shared_note') {
      console.log(
        'Skipping folder_structure_changed in useMarkdownEditor hook because eventType=shared_note'
      );
      return;
    }

    if (data?.isSharedView === true) {
      console.log(
        'Skipping folder_structure_changed in useMarkdownEditor hook because isSharedView=true'
      );
      return;
    }

    console.log(
      'Handling folder_structure_changed in useMarkdownEditor hook for my notes'
    );
    dispatch(fetchItems());
  };

  const handlePermissionChanged = (data: {
    resourceId: string;
    permission: string;
    shouldRefreshShared?: boolean;
  }) => {
    if (currentNote && currentNote._id === data.resourceId) {
      const updatedNote = {
        ...currentNote,
        permission: data.permission as 'view' | 'edit',
      };

      dispatch(setCurrentNote(updatedNote));
    }
  };

  useEffect(() => {
    SocketService.on('note_update', handleNoteUpdate);
    SocketService.on('typing', handleTyping);
    SocketService.on('stop_typing', handleStopTyping);
    SocketService.on('note_deleted', handleNoteDeleted);
    SocketService.on('note_renamed', handleNoteRenamed);
    SocketService.on('folder_deleted', handleFolderDeleted);
    SocketService.on('folder_structure_changed', handleFolderStructureChanged);
    SocketService.on('permission_changed', handlePermissionChanged);

    return () => {
      SocketService.off('note_update', handleNoteUpdate);
      SocketService.off('typing', handleTyping);
      SocketService.off('stop_typing', handleStopTyping);
      SocketService.off('note_deleted', handleNoteDeleted);
      SocketService.off('note_renamed', handleNoteRenamed);
      SocketService.off('folder_deleted', handleFolderDeleted);
      SocketService.off(
        'folder_structure_changed',
        handleFolderStructureChanged
      );
      SocketService.off('permission_changed', handlePermissionChanged);
    };
  }, [currentNote, dispatch, formatState, typingUsers, showAcceptReject]);

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

  const handleAction = (action: string, value?: any) => {
    if (isNoteDeleted) {
      return;
    }

    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (!range) return;

    const currentRange = { ...range };

    isUpdatingRef.current = true;

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
      case 'underline':
        quill.format('underline', !formatState.underline);
        newFormatState.underline = !formatState.underline;
        break;
      case 'blockquote':
        quill.format('blockquote', !formatState.blockquote);
        newFormatState.blockquote = !formatState.blockquote;
        break;
      case 'code-block':
        quill.format('code-block', !formatState.codeBlock);
        newFormatState.codeBlock = !formatState.codeBlock;
        break;
      case 'highlight':
        const highlightColor = value || '#FFFF00';
        quill.format(
          'highlight',
          formatState.highlight ? false : highlightColor
        );
        newFormatState.highlight = !formatState.highlight;
        break;
      case 'align':
        quill.format('align', value);
        newFormatState.align = value;
        break;
      case 'direction':
        quill.format('direction', value);
        newFormatState.direction = value;
        break;
      case 'indent':
        if (value === '+1') {
          quill.format('indent', (formatState.indent || 0) + 1);
          newFormatState.indent = (formatState.indent || 0) + 1;
        } else if (value === '-1') {
          quill.format('indent', Math.max((formatState.indent || 0) - 1, 0));
          newFormatState.indent = Math.max((formatState.indent || 0) - 1, 0);
        }
        break;
      case 'script':
        if (formatState.script === value) {
          quill.format('script', false);
          newFormatState.script = '';
        } else {
          quill.format('script', value);
          newFormatState.script = value;
        }
        break;
      case 'font':
        quill.format('font', value);
        newFormatState.font = value;
        break;
      case 'size':
        quill.format('size', value);
        newFormatState.size = value;
        break;
      case 'color':
        quill.format('color', value);
        newFormatState.color = value;
        break;
      case 'background':
        quill.format('background', value);
        newFormatState.background = value;
        break;
      case 'link':
        if (range.length === 0) return;
        const url = value || prompt('Nhập URL liên kết:');
        if (url) {
          quill.format('link', url);
          newFormatState.link = true;
        } else {
          quill.format('link', false);
          newFormatState.link = false;
        }
        break;
      case 'clear-format':
        quill.removeFormat(range.index, range.length);
        newFormatState = {
          bold: false,
          italic: false,
          header: false,
          strike: false,
          underline: false,
          list: '',
          script: '',
          indent: 0,
          direction: '',
          size: '',
          color: '',
          background: '',
          font: '',
          align: '',
          blockquote: false,
          codeBlock: false,
          highlight: false,
          link: false,
        };
        break;
      case 'list-dot':
        quill.format(
          'list',
          quill.getFormat().list === 'bullet' ? false : 'bullet'
        );
        newFormatState.list =
          quill.getFormat().list === 'bullet' ? '' : 'bullet';
        break;
      case 'list-number':
        quill.format(
          'list',
          quill.getFormat().list === 'ordered' ? false : 'ordered'
        );
        newFormatState.list =
          quill.getFormat().list === 'ordered' ? '' : 'ordered';
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

    setFormatState(newFormatState);

    if (currentNote) {
      const content = quill.root.innerHTML;
      const processedContent = preserveTrailingSpaces(content);
      dispatch(updateCurrentNoteContent(processedContent));
      SocketService.updateNoteImmediate(processedContent);
    }

    requestAnimationFrame(() => {
      quill.setSelection(currentRange.index, currentRange.length);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    });
  };

  const handleFormatAI = async () => {
    if (isNoteDeleted) {
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
    } catch (error) {
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

  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!quillRef.current) return;

    const quill = quillRef.current.getEditor();

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
          underline: !!format.underline,
          list: format.list || '',
          script: format.script || '',
          indent: format.indent || 0,
          direction: format.direction || '',
          size: format.size || '',
          color: format.color || '',
          background: format.background || '',
          font: format.font || '',
          align: format.align || '',
          blockquote: !!format.blockquote,
          codeBlock: !!format['code-block'],
          highlight: !!format.highlight,
          link: !!format.link,
        });
      } finally {
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    };

    quill.on('selection-change', updateFormatState);

    setTimeout(updateFormatState, 50);

    return () => {
      quill.off('selection-change', updateFormatState);
    };
  }, [quillRef.current, currentNote]);

  const exportToPDF = async () => {
    if (!currentNote) return;

    try {
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      const quillEditor = document.querySelector('.ql-editor');
      if (!quillEditor) return;

      const editorClone = quillEditor.cloneNode(true) as HTMLElement;
      const tempContainer = document.createElement('div');
      tempContainer.appendChild(editorClone);
      document.body.appendChild(tempContainer);

      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      editorClone.style.width = '794px';
      editorClone.style.padding = '40px';
      editorClone.style.backgroundColor = 'white';

      const canvas = await html2canvas(editorClone, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      let pageHeight = 295;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${currentNote.title || 'Untitled Note'}.pdf`;
      pdf.save(fileName);

      document.body.removeChild(tempContainer);

      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.');
    }
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
    isNoteDeleted,
    handleChange,
    handleAction,
    handleFormatAI,
    handleAccept,
    handleReject,
    dispatch,
    exportToPDF,
  };
};
