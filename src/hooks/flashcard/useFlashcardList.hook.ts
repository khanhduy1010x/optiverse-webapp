import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  FlashcardDeck,
  Flashcard as FlashcardType,
} from '../../types/flashcard/response/flashcard.response';
import { token } from '../../utils/apitest';

export function useFlashcardList() {
  const { deckId } = useParams();
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [deck, setDeck] = useState<FlashcardDeck>({
    _id: '',
    title: 'Loading',
    lastReview: 0,
    learningCount: 0,
    newCount: 0,
    reviewingCount: 0,
    user_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<'edit' | 'delete' | null>(null);
  const [popupItem, setPopupItem] = useState<FlashcardType | null>(null);

  const toggleOptions = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const closePopupAndRefresh = async () => {
    await fetchData();
    setSelectedId(null);
    setPopupType(null);
    setPopupItem(null);
  };

  const handleDelete = async (item: FlashcardType) => {
    try {
      await fetch(`http://localhost:81/productivity/flashcard/${item._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      await closePopupAndRefresh();
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:81/productivity/flashcard-deck/${deckId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = (await response.json()).data;
      setDeck(result);
      setFlashcards(result.flashcards);
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    deck,
    flashcards,
    loading,
    selectedId,
    popupType,
    popupItem,
    toggleOptions,
    setPopupType,
    setPopupItem,
    closePopupAndRefresh,
    handleDelete,
  };
}
