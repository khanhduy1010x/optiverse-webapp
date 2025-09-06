import { useState, useEffect } from 'react';
import { FlashcardDeckResponse } from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';
import { useAppTranslate } from '../useAppTranslate';
import { SearchForm } from '../../types/flashcard/flashcard.types';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export function useFlashcardDeckList() {
  const navigate = useNavigate();

  const { t } = useAppTranslate('flashcard');
  const { handleSubmit, control, watch, reset } = useForm<SearchForm>({
    values: {
      search: '',
    },
  });

  const [orgDecks, setOrgDecks] = useState<FlashcardDeckResponse[]>([]);
  const [decks, setDecks] = useState<FlashcardDeckResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<'edit' | 'delete' | 'add' | null>(
    null
  );
  const [popupItem, setPopupItem] = useState<FlashcardDeckResponse | null>(
    null
  );

  const toggleOptions = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const onSubmit = async (data: SearchForm) => {
    console.log('Search flashcard deck:', { data });
    setDecks(
      orgDecks.filter(deck =>
        deck.title.toLowerCase().includes(watch('search').trim().toLowerCase())
      )
    );
  };

  const fetchData = async () => {
    const data: FlashcardDeckResponse[] =
      await flashcardService.getFlashcardDeckList();
    setOrgDecks(data);
    setDecks(data);
    setLoading(false);
  };

  const handleDelete = async (item: FlashcardDeckResponse) => {
    await flashcardService.deleteFlashcardDeck(item._id);
    await closePopupAndRefresh();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPopup = (
    type: 'edit' | 'delete' | 'add',
    item: FlashcardDeckResponse | null
  ) => {
    setPopupType(type);
    setPopupItem(item);
  };

  const closePopup = () => {
    setSelectedId(null);
    setPopupType(null);
    setPopupItem(null);
  };

  const closePopupAndRefresh = async () => {
    closePopup();
    await refresh();
  };

  const refresh = async () => {
    reset({
      search: '',
    });

    await fetchData();
  };

  return {
    t,
    onSubmit,
    control,
    handleSubmit,
    refresh,
    decks,
    loading,
    selectedId,
    popupType,
    popupItem,
    toggleOptions,
    openPopup,
    closePopup,
    handleDelete,
    closePopupAndRefresh,
  };
}
