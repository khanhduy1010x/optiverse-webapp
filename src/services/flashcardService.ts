import { Flashcard } from '../types/flashcard.types';

const getDueFlashcards = (flashcards: Flashcard[]): Flashcard[] => {
  const now = new Date().getTime();

  return flashcards.filter(fc => {
    if (!fc.review) return true;
    const nextReview = new Date(fc.review.next_review).getTime();
    return nextReview <= now;
  });
};

export { getDueFlashcards };
