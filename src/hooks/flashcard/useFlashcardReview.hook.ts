import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getDueFlashcards } from '../../utils/flashcard/flashcard.util';
import {
  flashcardDeckMock,
  FlashcardDeckResponse,
  flashcardMock,
  FlashcardResponse,
} from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';
import { useFlashcardStreak } from '../streak/useFlashcardStreak.hook';

export function useFlashcardReview() {
  const { deckId } = useParams();
  const location = useLocation();
  const { title, mode } = location.state;
  const { updateFlashcardStreak } = useFlashcardStreak();

  const [flashcardDeck, setFlashcardDeck] =
    useState<FlashcardDeckResponse>(flashcardDeckMock);
  const [flashcard, setFlashcard] = useState<FlashcardResponse>(flashcardMock);
  const [showAnswer, setShowAnswer] = useState(false);

  const fetchData = async () => {
    const data = await flashcardService.getFlashcardList(deckId ? deckId : '');
    if (data.flashcards) {
      const dueFlashcards = getDueFlashcards(data.flashcards, mode);
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
    
    // Update flashcard streak when a flashcard is reviewed
    await updateFlashcardStreak();
    
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
