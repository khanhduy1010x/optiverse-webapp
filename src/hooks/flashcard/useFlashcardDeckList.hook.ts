import { useState, useEffect } from 'react';
import { FlashcardDeckResponse } from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';

export function useFlashcardDeckList() {
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

  const fetchData = async () => {
    const data: FlashcardDeckResponse[] =
      await flashcardService.getFlashcardDeckList();
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
    await fetchData();
  };

  return {
    decks,
    loading,
    selectedId,
    popupType,
    popupItem,
    toggleOptions,
    openPopup,
    closePopup,
    handleDelete,
    fetchData,
    closePopupAndRefresh,
  };
}
