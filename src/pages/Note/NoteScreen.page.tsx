import React from 'react';
import { useNote } from '../../hooks/note/useNote.hook';
import FolderNote from './FolderNote.screen';
import MarkdownEditor from './MarkdownEditor.screen';

const NoteScreen: React.FC = () => {
  useNote();

  return (
    <div className="flex h-screen relative">
      <div className="flex-1 flex flex-col">
        <MarkdownEditor />
      </div>
      <FolderNote />
    </div>
  );
};

export default NoteScreen;
