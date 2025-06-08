import { Entity } from '../../common/common.type';
import { ReviewSessionBase } from './reviewSession.entity';

export interface FlashcardBase extends Entity {
  deck_id?: string;
  front?: string;
  back?: string;
  review?: ReviewSessionBase;
}
