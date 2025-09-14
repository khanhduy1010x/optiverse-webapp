import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {  AppDispatch } from '../../store';
import { fetchItems } from '../../store/slices/items.slice';

export function useNoteInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchItems() as any);
  }, []);
}
