import { FlashcardBase } from '../entities/flashcard.entity';
import { FlashcardDeckBase } from '../entities/flashcardDeck.entity';

export interface CreateFlashcardDeckRequest extends FlashcardDeckBase {
  title: string;
  description: string;
}

export interface UpdateFlashcardDeckRequest extends FlashcardDeckBase {}

export interface CreateFlashcardRequest extends FlashcardBase {
  deck_id: string;
  front: string;
  back: string;
}

export interface UpdateFlashcardRequest extends FlashcardBase {
  _id: string;
}

export interface ReviewFlashcardRequest {
  flashcard_id: string;
  quality: number;
}
