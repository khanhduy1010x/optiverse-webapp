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
