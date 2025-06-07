import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  FlashcardDeck,
  Flashcard,
  initFlashcardDeckMock,
  FlashcardMock,
} from '../../types/flashcard/response/flashcard.response';
import { token } from '../../utils/apitest';
import { getDueFlashcards } from '../../utils/flashcard/flashcard.util';

export function useFlashcardReview() {
  const { deckId } = useParams();
  const location = useLocation();
  const { title } = location.state;

  const [flashcardDeck, setFlashcardDeck] = useState<FlashcardDeck>(
    initFlashcardDeckMock
  );
  const [flashcard, setFlashcard] = useState<Flashcard>(FlashcardMock);
  const [showAnswer, setShowAnswer] = useState(false);

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

      const data = (await response.json()).data;

      if (data.flashcards) {
        const dueFlashcards = getDueFlashcards(data.flashcards);
        data.flashcards = dueFlashcards;
        if (dueFlashcards.length > 0) {
          setFlashcard(dueFlashcards[0]);
        }
      }

      setFlashcardDeck(data);
    } catch (error) {
      console.error('Failed to fetch deck:', error);
    } finally {
      setShowAnswer(false);
    }
  };

  const handleReview = async (quality: number) => {
    try {
      await fetch(`http://localhost:81/productivity/review-session/review`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcard_id: flashcard._id,
          quality,
        }),
      });

      await fetchData();
    } catch (error) {
      console.error('Failed to review flashcard:', error);
    }
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
