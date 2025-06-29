import React from 'react';
import { useNote } from '../../hooks/note/useNote.hook';
import { useSharedItems } from '../../hooks/note/useSharedItems.hook';
import FolderNote from './FolderNote.screen';
import MarkdownEditor from './MarkdownEditor.screen';
import { NoteScreenProps } from '../../types/note/props/component.props';

const NoteScreen: React.FC<NoteScreenProps> = () => {
  useNote();
  useSharedItems();

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
