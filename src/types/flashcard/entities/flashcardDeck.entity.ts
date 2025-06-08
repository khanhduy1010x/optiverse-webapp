import { Entity } from '../../common/common.type';
import { FlashcardBase } from './flashcard.entity';

export interface FlashcardDeckBase extends Entity {
  user_id?: string;

  title?: string;

  description?: string;

  flashcards?: FlashcardBase[];
}
