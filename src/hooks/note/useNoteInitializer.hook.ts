import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchItems } from '../../store/slices/items.slice';

export function useNoteInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchItems() as any);
  }, []);
}
