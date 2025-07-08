import React from 'react';
import { useNote } from '../../hooks/note/useNote.hook';
import { useSharedItems } from '../../hooks/note/useSharedItems.hook';
import { useNoteInitializer } from '../../hooks/note/useNoteInitializer.hook';
import FolderNote from './FolderNote.screen';
import MarkdownEditor from './MarkdownEditor.screen';
import { NoteScreenProps } from '../../types/note/props/component.props';

const NoteScreen: React.FC<NoteScreenProps> = () => {
  // Khởi tạo data note một lần duy nhất
  useNoteInitializer();

  // Các hook khác chỉ xử lý logic, không gọi fetchItems
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
