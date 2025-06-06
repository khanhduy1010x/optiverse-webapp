import { useState, useEffect } from 'react';
import { FlashcardDeck } from '../../types/flashcard/response/flashcard.response';
import { token } from '../../utils/apitest';

export function useFlashcardDeckList() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<'edit' | 'delete' | 'add' | null>(
    null
  );
  const [popupItem, setPopupItem] = useState<FlashcardDeck | null>(null);

  const toggleOptions = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:81/productivity/flashcard-deck/all`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result: FlashcardDeck[] = (await response.json()).data;
      setDecks(result);
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: FlashcardDeck) => {
    try {
      await fetch(
        `http://localhost:81/productivity/flashcard-deck/${item._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      await fetchData();
      setPopupType(null);
      setPopupItem(null);
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPopup = (
    type: 'edit' | 'delete' | 'add',
    item: FlashcardDeck | null
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
