import { FlashcardResponse } from '../../types/flashcard/response/flashcard.response';

const getDueFlashcards = (
  flashcards: FlashcardResponse[],
  mode: string
): FlashcardResponse[] => {
  const now = new Date().getTime();

  if (mode === 'unlimited') {
    return flashcards
      .map((fc, index) => ({ ...fc, index }))
      .sort((a, b) => {
        if (!a.review) {
          return 1;
        }

        if (!b.review) {
          return -1;
        }

        return (
          new Date(a.review.last_review).getTime() -
          new Date(b.review.last_review).getTime()
        );
      });
  }

  return flashcards.filter(fc => {
    if (!fc.review) return true;
    const nextReview = new Date(fc.review.next_review).getTime();
    return nextReview <= now;
  });
};

export { getDueFlashcards };
