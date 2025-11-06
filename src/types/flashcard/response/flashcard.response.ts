import { WithSomeRequired } from '../../common/common.type';
import { FlashcardBase } from '../entities/flashcard.entity';
import { FlashcardDeckBase } from '../entities/flashcardDeck.entity';
import { ReviewSessionBase } from '../entities/reviewSession.entity';

interface ReviewLearning {
  lastReview: number;
  newCount: number;
  learningCount: number;
  reviewingCount: number;
}

export interface ReviewResponse
  extends WithSomeRequired<
    ReviewSessionBase,
    | '_id'
    | 'flashcard_id'
    | 'user_id'
    | 'ease_factor'
    | 'interval'
    | 'last_review'
    | 'next_review'
    | 'repetition_count'
    | 'quality'
  > {}

export interface FlashcardResponse
  extends WithSomeRequired<
    FlashcardBase,
    '_id' | 'deck_id' | 'front' | 'back' | 'review'
  > {
  review: ReviewResponse;
}

export interface FlashcardDeckResponse
  extends ReviewLearning,
    WithSomeRequired<FlashcardDeckBase, '_id' | 'user_id' | 'title'> {
  flashcards: FlashcardResponse[];
  creator?: {
    _id: string;
    username?: string;
    email?: string;
    full_name?: string;
  };
}

export const reviewMock: ReviewResponse = {
  _id: '',
  flashcard_id: '',
  user_id: '',
  ease_factor: 0,
  interval: 0,
  last_review: new Date(),
  next_review: new Date(),
  repetition_count: 0,
  quality: 0,
};

export const flashcardMock: FlashcardResponse = {
  _id: '',
  deck_id: '',
  front: '',
  back: '',
  review: {
    ...reviewMock,
  },
};

export const flashcardDeckMock: FlashcardDeckResponse = {
  _id: '',
  title: '',
  user_id: '',
  flashcards: [
    {
      ...flashcardMock,
    },
  ],
  lastReview: 0,
  learningCount: 0,
  newCount: 0,
  reviewingCount: 0,
};
