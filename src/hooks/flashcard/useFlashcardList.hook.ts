import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  flashcardDeckMock,
  FlashcardDeckResponse,
  FlashcardResponse,
} from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';

export function useFlashcardList() {
  const navigate = useNavigate();
  const { deckId } = useParams();
  const [deck, setDeck] = useState<FlashcardDeckResponse>(flashcardDeckMock);
  const [loading, setLoading] = useState(true);
  const [popupType, setPopupType] = useState<'edit' | 'delete' | null>(null);
  const [popupItem, setPopupItem] = useState<FlashcardResponse | null>(null);


  const closePopupAndRefresh = async () => {
    await fetchData();
    setPopupType(null);
    setPopupItem(null);
  };

  const handleDelete = async (item: FlashcardResponse) => {
    await flashcardService.deleteFlashcard(item._id);
    await closePopupAndRefresh();
  };

  const fetchData = async () => {
    try {
      const data = await flashcardService.getFlashcardList(
        deckId ? deckId : ''
      );
      if (data === undefined) {
        throw Error('Cannot find data');
      }
      setDeck(data);
      setLoading(false);
    } catch {
      navigate('/flashcard-deck');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    navigate,
    deck,
    loading,
    popupType,
    popupItem,
    setPopupType,
    setPopupItem,
    closePopupAndRefresh,
    handleDelete,
  };
}
