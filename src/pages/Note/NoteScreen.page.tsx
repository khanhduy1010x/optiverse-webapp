import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { RootState, AppDispatch } from '../../store';
import { saveNote } from '../../store/slices/items.slice';
import FolderNote from './FolderNote.screen';
import MarkdownEditor from './MarkdownEditor.screen';

const NoteScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentNote } = useSelector((state: RootState) => state.items);

  useEffect(() => {
    if (!currentNote || !currentNote.content?.trim()) {
      return;
    }

    const debouncedSave = debounce(async () => {
      try {
        await dispatch(saveNote({note: currentNote, shouldSetCurrent: true})).unwrap();
      } catch (error) {
        console.error('Failed to auto-save note:', currentNote.title, error);
      }
    }, 5000);

    debouncedSave();

    return () => {
      debouncedSave.cancel();
    };
  }, [currentNote, dispatch]);

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