import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../styles/note/MarkdownEditor.style.css';

interface AchievementEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  onBlur?: () => void;
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['clean']
  ]
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'blockquote', 'code-block',
  'link',
  'color', 'background',
  'align'
];

const AchievementEditor: React.FC<AchievementEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter achievement description...",
  hasError = false,
  onBlur
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const handleChange = (content: string) => {
    onChange(content);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  return (
    <div className={`achievement-editor ${hasError ? 'border-red-300' : 'border-gray-300'}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
        className={`markdown-editor ${hasError ? 'border-red-300' : ''}`}
        style={{
          height: '200px',
          marginBottom: '42px'
        }}
      />
    </div>
  );
};

export default AchievementEditor;