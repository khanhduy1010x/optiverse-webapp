import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { RootState, AppDispatch } from '../../store';
import { saveNote } from '../../store/slices/noteSlice';
import FolderNote from './FolderNote';
import MarkdownEditor from './MarkdownEditor';

const NoteScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentNote } = useSelector((state: RootState) => state.notes);

  useEffect(() => {
    if (!currentNote) return;

    const debouncedSave = debounce(async () => {
      try {
        await dispatch(saveNote(currentNote)).unwrap();
        console.log('Auto save successfully');
      } catch (error) {
        console.error('Failed to auto save:', error);
      }
    }, 5000);

    debouncedSave();

    return () => {
      debouncedSave.cancel();
    };
  }, [currentNote, dispatch]);

  return (
    <div className="flex h-screen">
      <FolderNote />
      <div className="flex-1 flex flex-col">
        <MarkdownEditor />
      </div>
    </div>
  );
};

export default NoteScreen;