import { Entity } from '../../common/common.type';

export interface ReviewSessionBase extends Entity {
  flashcard_id?: string;

  user_id?: string;

  last_review?: Date;

  next_review?: Date;

  interval?: number;

  ease_factor?: number;

  repetition_count?: number;

  quality?: number;
}
