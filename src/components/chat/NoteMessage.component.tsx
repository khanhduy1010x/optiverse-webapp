import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../styles/note/NoteMessage.style.css';
import { NoteMessageProps } from '../../types/chat/props/component.props';


const quillModules = {
    toolbar: false
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'script',
    'indent',
    'direction',
    'size',
    'color', 'background',
    'font',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video',
    'highlight'
];

const NoteMessage: React.FC<NoteMessageProps> = ({ title, content }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm max-w-md">
            <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-[#21b4ca] rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                    📝
                </div>
                <div>
                    <h3 className="font-semibold text-black text-sm">{title}</h3>
                    <p className="text-xs text-gray-500">Shared Note</p>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
                <div className="note-content-preview text-black">
                    <ReactQuill
                        value={content}
                        readOnly={true}
                        theme="snow"
                        modules={quillModules}
                        formats={quillFormats}
                        className="note-message-quill"
                    />
                </div>
            </div>
        </div>
    );
};

export default NoteMessage; 