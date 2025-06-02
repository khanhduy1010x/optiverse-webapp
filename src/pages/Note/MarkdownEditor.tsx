import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { RootState } from '../../store';
import { setCurrentNote } from '../../store/slices/itemsSlice';
import { setIsAiFormatting, setShowWarningModal } from '../../store/slices/uiSlice';
import ToolBarNote from './ToolbarNote';
import { formatDateTime, formatDateTimeFull } from '../../utils/dateUtils';
import { NoteService } from '../../services/NoteService';
import Icon from '../../components/common/Icon/Icon';
import { socketService } from '../../services/SocketService';
import { toast } from 'react-toastify';
import './MarkdownEditor.css';
import { UserCursorsContainer, UserCursor } from './UserCursorsContainer';
import { v4 as uuidv4 } from 'uuid';

const cleanGeminiHtml = (raw: string) => {
  return raw
    .replace(/^```html[\r\n]*/i, '')
    .replace(/^```[\r\n]*/i, '')
    .replace(/```$/i, '')
    .trim();
};

const MarkdownEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { currentNote } = useSelector((state: RootState) => state.items);
  const { isAiFormatting, showWarningModal } = useSelector((state: RootState) => state.ui);

  const quillRef = useRef<ReactQuill>(null);
  const prevNoteId = useRef<string | undefined>(currentNote?._id);
  const isSocketUpdate = useRef<boolean>(false);
  const userCursorsRef = useRef<React.ElementRef<typeof UserCursorsContainer>>(null);
  // Tạo ID người dùng ngẫu nhiên và giữ cố định trong suốt phiên làm việc
  const userIdRef = useRef<string>(uuidv4());
  const userNameRef = useRef<string>(`User-${Math.floor(Math.random() * 1000)}`);

  const [isFormatting, setIsFormatting] = useState(false);
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [oldContent, setOldContent] = useState<string | null>(null);
  const [showAcceptReject, setShowAcceptReject] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  // Thêm state theo dõi trạng thái định dạng
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    header: false,
    strike: false
  });

  // Cập nhật trạng thái isAiFormatting trong Redux khi showAcceptReject thay đổi
  useEffect(() => {
    dispatch(setIsAiFormatting(showAcceptReject));
  }, [showAcceptReject, dispatch]);

  const skipNextOnChange = useRef(false);
  useEffect(() => {
    if (!showAcceptReject) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [showAcceptReject]);


  useEffect(() => {
    if (!showAcceptReject) return;
    const handleBlock = (e: any) => {
      e.preventDefault();
      e.returnValue = false;
      dispatch(setShowWarningModal(true));
      return false;
    };
    window.addEventListener('popstate', handleBlock);
    return () => window.removeEventListener('popstate', handleBlock);
  }, [showAcceptReject, dispatch]);

  // Khởi tạo kết nối socket khi component được mount
  useEffect(() => {
    socketService.connect();

    // Xóa tất cả con trỏ khi khởi tạo
    if (userCursorsRef.current) {
      userCursorsRef.current.clearAllCursors();
    }

    return () => {
      socketService.disconnect();

      // Xóa tất cả con trỏ khi unmount
      if (userCursorsRef.current) {
        userCursorsRef.current.clearAllCursors();
      }
    };
  }, []);

  // Xử lý khi note hiện tại thay đổi
  useEffect(() => {
    if (
      quillRef.current &&
      currentNote &&
      prevNoteId.current !== currentNote._id &&
      !showAcceptReject
    ) {
      // Xóa tất cả con trỏ khi chuyển sang note mới
      if (userCursorsRef.current) {
        userCursorsRef.current.clearAllCursors();
      }

      const quill = quillRef.current.getEditor();
      skipNextOnChange.current = true;
      quill.setContents(quill.clipboard.convert(currentNote.content || ''));

      // Lưu ID note cũ trước khi cập nhật
      const oldNoteId = prevNoteId.current;
      prevNoteId.current = currentNote._id;

      // Tham gia vào phòng của note mới
      if (currentNote._id) {
        socketService.joinNote(currentNote._id);
      }
    }
  }, [currentNote, showAcceptReject]);

  // Xử lý khi component unmount hoặc note thay đổi
  useEffect(() => {
    return () => {
      // Xóa tất cả con trỏ khi unmount hoặc note thay đổi
      if (userCursorsRef.current) {
        userCursorsRef.current.clearAllCursors();
      }

      // Rời khỏi phòng note hiện tại nếu có
      if (currentNote?._id) {
        socketService.leaveNote(currentNote._id);
      }
    };
  }, [currentNote?._id]);

  // Xử lý cập nhật nội dung từ socket
  useEffect(() => {
    if (!currentNote?._id) return;

    const handleNoteUpdate = (data: any) => {
      if (data.noteId === currentNote._id && quillRef.current && data.content !== currentNote.content) {
        isSocketUpdate.current = true;
        const quill = quillRef.current.getEditor();

        // Lưu vị trí con trỏ hiện tại
        const range = quill.getSelection();

        skipNextOnChange.current = true;
        quill.setContents(quill.clipboard.convert(data.content));
        dispatch(setCurrentNote({ ...currentNote, content: data.content }));

        // Khôi phục vị trí con trỏ sau khi cập nhật nội dung
        if (range) {
          setTimeout(() => {
            quill.setSelection(range);
          }, 10);
        }

        console.log('🟢 Đồng bộ nội dung từ server');
      }
    };

    const handleNoteError = (data: any) => {
      if (data.noteId === currentNote._id) {
        toast.error(`❌ Lỗi: ${data.error}`);
      }
    };

    const handleTyping = (data: any) => {
      if (data.noteId === currentNote._id && data.userId !== socketService.getUserId()) {
        setTypingUsers(prev => {
          const newUsers = new Set(prev);
          newUsers.add(data.userId);
          return newUsers;
        });
      }
    };

    const handleStopTyping = (data: any) => {
      if (data.noteId === currentNote._id) {
        setTypingUsers(prev => {
          const newUsers = new Set(prev);
          newUsers.delete(data.userId);
          return newUsers;
        });
      }
    };

    // Thêm xử lý sự kiện user_cursors
    const handleUserCursors = (data: any) => {
      if (data.noteId === currentNote._id && data.cursors && userCursorsRef.current) {
        // Cập nhật vị trí con trỏ của các user khác
        data.cursors.forEach((cursor: UserCursor) => {
          if (cursor.userId !== socketService.getUserId()) {
            userCursorsRef.current?.updateCursors(cursor);
          }
        });
      }
    };

    // Thêm xử lý sự kiện user_left
    const handleUserLeft = (data: any) => {
      if (data.noteId === currentNote._id && data.userId && userCursorsRef.current) {
        // Xóa con trỏ của user đã rời đi
        userCursorsRef.current.removeCursor(data.userId);
      }
    };

    socketService.on('note_update', handleNoteUpdate);
    socketService.on('note_error', handleNoteError);
    socketService.on('typing', handleTyping);
    socketService.on('stop_typing', handleStopTyping);
    socketService.on('user_cursors', handleUserCursors);
    socketService.on('user_left', handleUserLeft);

    return () => {
      socketService.off('note_update', handleNoteUpdate);
      socketService.off('note_error', handleNoteError);
      socketService.off('typing', handleTyping);
      socketService.off('stop_typing', handleStopTyping);
      socketService.off('user_cursors', handleUserCursors);
      socketService.off('user_left', handleUserLeft);
    };
  }, [currentNote, dispatch]);

  const prevPreviewNoteId = useRef<string | undefined>(currentNote?._id);
  useEffect(() => {
    if (!showAcceptReject) {
      prevPreviewNoteId.current = currentNote?._id;
    }
  }, [currentNote?._id, showAcceptReject]);

  // Thêm xử lý sự kiện paste riêng
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const handlePaste = () => {
        if (currentNote && !showAcceptReject) {
          // Lưu vị trí con trỏ hiện tại
          const range = quill.getSelection();

          // Chờ một tick để nội dung được cập nhật sau khi paste
          setTimeout(() => {
            const content = quill.root.innerHTML;
            dispatch(setCurrentNote({ ...currentNote, content }));
            // Gửi nội dung cập nhật qua socket ngay lập tức khi paste
            socketService.updateNoteImmediate(content);

            // Khôi phục vị trí con trỏ
            if (range) {
              quill.setSelection(range.index + 1, 0);
            }
          }, 10);
        }
      };

      quill.root.addEventListener('paste', handlePaste);
      return () => {
        quill.root.removeEventListener('paste', handlePaste);
      };
    }
  }, [quillRef.current, currentNote, showAcceptReject, dispatch]);

  // Thêm xử lý sự kiện key để gửi cập nhật ngay lập tức khi Enter và xử lý space
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (currentNote && !showAcceptReject) {
          if (e.key === 'Enter') {
            // Gửi cập nhật ngay lập tức khi người dùng bấm Enter
            setTimeout(() => {
              const content = quill.root.innerHTML;
              socketService.updateNoteImmediate(content);
            }, 10);
          } else if (e.key === ' ') {
            // Xử lý đặc biệt cho space
            setTimeout(() => {
              const selection = quill.getSelection();
              if (selection) {
                // Lưu vị trí con trỏ
                const range = selection;

                // Lấy nội dung và cập nhật
                const content = quill.root.innerHTML;

                // Đảm bảo khoảng trắng cuối cùng được giữ lại
                const processedContent = preserveTrailingSpaces(content);

                dispatch(setCurrentNote({ ...currentNote, content: processedContent }));
                socketService.updateNote(processedContent);

                // Khôi phục vị trí con trỏ
                setTimeout(() => {
                  quill.setSelection(range.index, range.length);
                }, 0);
              }
            }, 10);
          }
        }
      };

      // Thêm xử lý sự kiện input để bắt tất cả các thay đổi nội dung
      const handleInput = () => {
        if (currentNote && !showAcceptReject) {
          const selection = quill.getSelection();
          if (selection) {
            // Lấy nội dung và cập nhật
            const content = quill.root.innerHTML;

            // Đảm bảo khoảng trắng cuối cùng được giữ lại
            const processedContent = preserveTrailingSpaces(content);

            // Chỉ cập nhật nếu nội dung thực sự thay đổi
            if (processedContent !== currentNote.content) {
              dispatch(setCurrentNote({ ...currentNote, content: processedContent }));
              socketService.updateNote(processedContent);
            }
          }
        }
      };

      quill.root.addEventListener('keydown', handleKeyDown);
      quill.root.addEventListener('input', handleInput);

      return () => {
        quill.root.removeEventListener('keydown', handleKeyDown);
        quill.root.removeEventListener('input', handleInput);
      };
    }
  }, [quillRef.current, currentNote, showAcceptReject, dispatch]);

  // Hàm xử lý khoảng trắng cuối cùng
  const preserveTrailingSpaces = (content: string): string => {
    // Thay thế &nbsp; cuối cùng bằng dấu cách thường
    return content.replace(/(&nbsp;)+$/, (match) => {
      return ' '.repeat(match.length / 6); // &nbsp; có 6 ký tự
    });
  };

  // Thêm useEffect để xử lý vấn đề text không xuống dòng
  useEffect(() => {
    if (quillRef.current) {
      // Thêm CSS trực tiếp vào editor để đảm bảo văn bản xuống dòng
      const quill = quillRef.current.getEditor();
      const editorElement = quill.root;

      // Đặt CSS trực tiếp cho phần tử editor nếu là HTMLElement
      if (editorElement instanceof HTMLElement) {
        editorElement.style.whiteSpace = 'pre-wrap';
        editorElement.style.wordWrap = 'break-word';
        editorElement.style.wordBreak = 'break-word';
        editorElement.style.overflowWrap = 'break-word';
        editorElement.style.overflowX = 'hidden';
        editorElement.style.maxWidth = '100%';

        // Tìm container của Quill và thiết lập CSS
        const container = editorElement.closest('.ql-container');
        if (container instanceof HTMLElement) {
          container.style.maxWidth = '100%';
          container.style.overflowX = 'hidden';
        }
      }
    }
  }, [quillRef.current]);

  // Thêm useEffect để theo dõi trạng thái định dạng
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();

      // Hàm cập nhật trạng thái định dạng khi selection thay đổi
      const updateFormatState = () => {
        const format = quill.getFormat();
        setFormatState({
          bold: !!format.bold,
          italic: !!format.italic,
          header: format.header === 1,
          strike: !!format.strike
        });
      };

      // Theo dõi sự kiện selection-change để cập nhật trạng thái định dạng
      quill.on('selection-change', (range) => {
        if (range) {
          updateFormatState();

          // Thêm: Gửi vị trí con trỏ mới tới các người dùng khác
          if (currentNote?._id && !showAcceptReject) {
            socketService.updateCursorPosition(range, userNameRef.current);
          }
        }
      });

      // Theo dõi sự kiện text-change để cập nhật trạng thái định dạng
      quill.on('text-change', () => {
        updateFormatState();

        // Thêm: Gửi vị trí con trỏ mới sau khi text thay đổi
        const range = quill.getSelection();
        if (range && currentNote?._id && !showAcceptReject) {
          socketService.updateCursorPosition(range, userNameRef.current);
        }
      });

      // Cập nhật ban đầu
      updateFormatState();

      return () => {
        quill.off('selection-change', updateFormatState);
        quill.off('text-change', updateFormatState);
      };
    }
  }, [quillRef.current, currentNote?._id, showAcceptReject]);

  // Thêm useEffect đơn giản để tự động cuộn khi nhập vượt quá view
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();

      // Hàm tự động cuộn khi nhập text
      const autoScroll = () => {
        const selection = quill.getSelection();
        if (!selection) return;

        // Tìm container của editor
        const scrollContainer = document.querySelector('.quill-wrapper');
        if (!scrollContainer) return;

        // Lấy vị trí của con trỏ
        const [leaf] = quill.getLeaf(selection.index);
        if (!leaf || !leaf.domNode) return;

        // Tìm phần tử DOM của con trỏ
        const leafElement = leaf.domNode.parentElement;
        if (!leafElement) return;

        // Lấy vị trí của phần tử và container
        const leafRect = leafElement.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();

        // Nếu con trỏ nằm gần cuối view (150px), thực hiện cuộn
        if (leafRect.bottom > containerRect.bottom - 150) {
          // Cuộn để đưa con trỏ vào giữa view
          leafElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      };

      // Thêm listener cho sự kiện text-change
      quill.on('text-change', autoScroll);

      return () => {
        quill.off('text-change', autoScroll);
      };
    }
  }, [quillRef.current]);

  // Xử lý khi người dùng chọn note khác mà đang có format AI preview
  useEffect(() => {
    if (
      showAcceptReject &&
      prevPreviewNoteId.current &&
      currentNote?._id !== prevPreviewNoteId.current
    ) {
      // Hiển thị modal thay vì tự động reject
      dispatch(setShowWarningModal(true));
      // Không tự động đặt lại trạng thái showAcceptReject
    }
  }, [currentNote?._id, showAcceptReject, dispatch]);

  const handleChange = (content: string, delta: any, source: string) => {
    if (skipNextOnChange.current) {
      skipNextOnChange.current = false;
      return;
    }
    if (!currentNote) return;
    if (!showAcceptReject) {
      // Lưu vị trí con trỏ hiện tại
      const range = quillRef.current?.getEditor().getSelection();

      // Xử lý đặc biệt cho khoảng trắng cuối cùng
      let processedContent = content;
      if (delta && delta.ops && delta.ops.length > 0) {
        const lastOp = delta.ops[delta.ops.length - 1];
        if (lastOp.insert === ' ' || (typeof lastOp.insert === 'string' && lastOp.insert.endsWith(' '))) {
          // Đảm bảo khoảng trắng cuối cùng được giữ lại
          processedContent = preserveTrailingSpaces(content);
        }
      }

      dispatch(setCurrentNote({ ...currentNote, content: processedContent }));

      // Gửi nội dung cập nhật qua socket
      socketService.updateNote(processedContent);

      // Khôi phục vị trí con trỏ sau khi cập nhật nội dung
      if (range && quillRef.current) {
        setTimeout(() => {
          quillRef.current?.getEditor().setSelection(range);
        }, 0);
      }
    }
  };

  const handleAction = (action: string) => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();

    // Lưu vị trí con trỏ hiện tại
    const range = quill.getSelection();
    if (!range) return;

    switch (action) {
      case 'bold':
        const newBoldValue = !quill.getFormat().bold;
        quill.format('bold', newBoldValue);
        setFormatState(prev => ({ ...prev, bold: newBoldValue }));
        break;
      case 'italic':
        const newItalicValue = !quill.getFormat().italic;
        quill.format('italic', newItalicValue);
        setFormatState(prev => ({ ...prev, italic: newItalicValue }));
        break;
      case 'title':
        const newHeaderValue = quill.getFormat().header === 1 ? false : 1;
        quill.format('header', newHeaderValue);
        setFormatState(prev => ({ ...prev, header: newHeaderValue === 1 }));
        break;
      case 'strike':
        const newStrikeValue = !quill.getFormat().strike;
        quill.format('strike', newStrikeValue);
        setFormatState(prev => ({ ...prev, strike: newStrikeValue }));
        break;
      case 'clear-format':
        if (range) {
          quill.removeFormat(range.index, range.length);
          setFormatState({
            bold: false,
            italic: false,
            header: false,
            strike: false
          });
        }
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

    // Khôi phục vị trí con trỏ sau khi thực hiện thao tác
    setTimeout(() => {
      quill.setSelection(range.index, range.length);

      // Gửi nội dung cập nhật sau khi thực hiện thao tác
      if (currentNote) {
        const content = quill.root.innerHTML;
        const processedContent = preserveTrailingSpaces(content);
        dispatch(setCurrentNote({ ...currentNote, content: processedContent }));
        socketService.updateNoteImmediate(processedContent);
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
      // Gửi nội dung đã format qua socket ngay lập tức
      socketService.updateNoteImmediate(aiContent);
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
      {/* Header */}
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
      {/* Loading overlay */}
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
          <UserCursorsContainer
            ref={userCursorsRef}
            quillRef={quillRef}
            currentUserId={socketService.getUserId()}
          />
        </div>
      </div>

      <ToolBarNote onAction={handleAction} formatState={formatState} />

      {/* Modal cảnh báo khi chuyển note mà chưa accept/reject format AI */}
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
