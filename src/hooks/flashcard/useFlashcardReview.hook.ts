import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { token } from '../../utils/apitest';
import { getDueFlashcards } from '../../utils/flashcard/flashcard.util';
import {
  flashcardDeckMock,
  FlashcardDeckResponse,
  flashcardMock,
  FlashcardResponse,
} from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';

export function useFlashcardReview() {
  const { deckId } = useParams();
  const location = useLocation();
  const { title } = location.state;

  const [flashcardDeck, setFlashcardDeck] =
    useState<FlashcardDeckResponse>(flashcardDeckMock);
  const [flashcard, setFlashcard] = useState<FlashcardResponse>(flashcardMock);
  const [showAnswer, setShowAnswer] = useState(false);

  const fetchData = async () => {
    const data = await flashcardService.getFlashcardList(deckId ? deckId : '');
    if (data.flashcards) {
      const dueFlashcards = getDueFlashcards(data.flashcards);
      data.flashcards = dueFlashcards;
      if (dueFlashcards.length > 0) {
        setFlashcard(dueFlashcards[0]);
      }
    }

    setFlashcardDeck(data);
    setShowAnswer(false);
  };

  const handleReview = async (quality: number) => {
    await flashcardService.reviewFlashcard({
      flashcard_id: flashcard._id,
      quality,
    });
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    title,
    flashcardDeck,
    flashcard,
    showAnswer,
    setShowAnswer,
    handleReview,
  };
}
