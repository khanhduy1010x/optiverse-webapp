import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  flashcardDeckMock,
  FlashcardDeckResponse,
  FlashcardResponse,
} from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';

export function useFlashcardList() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState<FlashcardDeckResponse>(flashcardDeckMock);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<'edit' | 'delete' | null>(null);
  const [popupItem, setPopupItem] = useState<FlashcardResponse | null>(null);

  const toggleOptions = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const closePopupAndRefresh = async () => {
    await fetchData();
    setSelectedId(null);
    setPopupType(null);
    setPopupItem(null);
  };

  const handleDelete = async (item: FlashcardResponse) => {
    await flashcardService.deleteFlashcard(item._id);
    await closePopupAndRefresh();
  };

  const fetchData = async () => {
    const data = await flashcardService.getFlashcardList(deckId ? deckId : '');
    setDeck(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    deck,
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
