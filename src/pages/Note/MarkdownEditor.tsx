import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { RootState } from '../../store';
import { setCurrentNote } from '../../store/slices/itemsSlice';
import ToolBarNote from './ToolbarNote';
import { formatDateTime, formatDateTimeFull } from '../../utils/dateUtils';

const MarkdownEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { currentNote } = useSelector((state: RootState) => state.items);
  const quillRef = useRef<ReactQuill>(null);

  const skipNextOnChange = useRef(false);

  useEffect(() => {
    if (quillRef.current && currentNote) {
      const quill = quillRef.current.getEditor();
      const editorHtml = quill.root.innerHTML;
      const expectedHtml = currentNote.content || '';

      if (editorHtml !== expectedHtml) {
        skipNextOnChange.current = true;
        quill.setContents(quill.clipboard.convert(expectedHtml));
      }
    }
  }, [currentNote]);

  const handleChange = (content: string, delta: any, source: string) => {
    if (skipNextOnChange.current) {
      skipNextOnChange.current = false;
      return;
    }

    if (!currentNote) return;

    if (source === 'user') {
      dispatch(setCurrentNote({ ...currentNote, content }));
    }
  };

  const handleAction = (action: string) => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();

    switch (action) {
      case 'bold':
        quill.format('bold', !quill.getFormat().bold);
        break;
      case 'italic':
        quill.format('italic', !quill.getFormat().italic);
        break;
      case 'title':
        quill.format('header', quill.getFormat().header === 1 ? false : 1);
        break;
      case 'strike':
        quill.format('strike', !quill.getFormat().strike);
        break;
      case 'clear-format':
        const selection = quill.getSelection();
        if (selection) {
          quill.removeFormat(selection.index, selection.length);
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
  };

  return (
    <div className="flex w-full flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {currentNote?.title || 'Chưa chọn ghi chú'}
          </h1>
          {currentNote?.updatedAt && (
            <div className="flex justify-center items-center text-sm text-gray-500">
            Last saved: {formatDateTimeFull(currentNote.updatedAt)}
            </div>
          )}
        </div>
      </div>

      <ReactQuill
        ref={quillRef}
        value={currentNote?.content || ''}
        onChange={handleChange}
        className="flex-1"
        theme="snow"
        modules={{
          history: {
            delay: 1000,
            maxStack: 100,
            userOnly: false,
          },
          toolbar: false,
        }}
      />

      <ToolBarNote onAction={handleAction} />
    </div>
  );
};

export default MarkdownEditor;
