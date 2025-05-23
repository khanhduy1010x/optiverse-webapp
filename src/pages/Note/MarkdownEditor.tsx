import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { RootState } from '../../store';
import { setCurrentNote } from '../../store/slices/noteSlice';
import ToolBarNote from './ToolbarNote';

const MarkdownEditor: React.FC = () => {
  const dispatch = useDispatch();
  const { currentNote } = useSelector((state: RootState) => state.notes);
  const quillRef = useRef<ReactQuill>(null);

  const handleChange = (content: string) => {
    if (currentNote) {
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
        quill.removeFormat(quill.getSelection()?.index || 0, quill.getSelection()?.length || 0);
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
    <div className="flex flex-col h-full">
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