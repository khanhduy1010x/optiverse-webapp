export interface FlashcardDeck {
  _id: string;

  user_id: string;

  title: string;

  description?: string;

  lastReview: number;
  newCount: number;
  learningCount: number;
  reviewingCount: number;

  flashcards?: Flashcard[];
}

// Mock data for flashcard deck
export const FlashCardDeckMock: FlashcardDeck = {
  _id: '',
  title: '',
  lastReview: 0,
  learningCount: 0,
  newCount: 0,
  reviewingCount: 0,
  user_id: '',
};
export const FlashCardDeckLoadingMock: FlashcardDeck = {
  ...FlashCardDeckMock,
  title: 'Loading',
};
export const initFlashcardDeckMock: FlashcardDeck = {
  _id: '',
  lastReview: 0,
  learningCount: 0,
  newCount: 0,
  reviewingCount: 0,
  title: '',
  user_id: '',
  description: '',
  flashcards: [
    {
      _id: '',
      front: '',
      back: '',
      deck_id: '',
      review: {
        _id: '',
        flashcard_id: '',
        user_id: '',
        ease_factor: 0,
        interval: 0,
        last_review: new Date(),
        next_review: new Date(),
        repetition_count: 0,
        quality: 0,
      },
    },
  ],
};
//End of mock data for flashcard deck
export interface Flashcard {
  _id: string;

  deck_id: string;

  front: string;

  back: string;

  review: FlashcardReview;
}
export interface FlashcardReview {
  _id: string;

  flashcard_id: string;

  user_id: string;

  last_review: Date;

  next_review: Date;

  interval: number;

  ease_factor: number;

  repetition_count: number;

  quality: number;
}
export const FlashcardMock: Flashcard = {
  _id: '',
  front: '',
  back: '',
  deck_id: '',
  review: {
    _id: '',
    flashcard_id: '',
    user_id: '',
    ease_factor: 0,
    interval: 0,
    last_review: new Date(),
    next_review: new Date(),
    repetition_count: 0,
    quality: 0,
  },
};
