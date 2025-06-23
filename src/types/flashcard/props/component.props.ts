import {
  FlashcardDeckResponse,
  FlashcardResponse,
} from '../response/flashcard.response';

export interface FlashcardDeckListProps {
  decks: FlashcardDeckResponse[];
  onAddDeck: () => void;
  onSelectDeck: (deck: FlashcardDeckResponse) => void;
  onDeleteDeck: (id: string) => void;
  onEditDeck: (deck: FlashcardDeckResponse) => void;
}

export interface FlashcardDeckItemProps {
  deck: FlashcardDeckResponse;
  onSelect: (deck: FlashcardDeckResponse) => void;
  onDelete: (id: string) => void;
  onEdit: (deck: FlashcardDeckResponse) => void;
}

export interface FlashcardListProps {
  deck: FlashcardDeckResponse;
  flashcards: FlashcardResponse[];
  onAddFlashcard: () => void;
  onEditFlashcard: (flashcard: FlashcardResponse) => void;
  onDeleteFlashcard: (id: string) => void;
  onStartReview: () => void;
}

export interface FlashcardItemProps {
  flashcard: FlashcardResponse;
  onEdit: (flashcard: FlashcardResponse) => void;
  onDelete: (id: string) => void;
}

export interface FlashcardFormProps {
  front: string;
  back: string;
  onFrontChange: (value: string) => void;
  onBackChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
}

export interface FlashcardDeckFormProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error?: string;
}

export interface FlashcardReviewProps {
  flashcard: FlashcardResponse;
  onAnswer: (quality: number) => void;
  isShowingAnswer: boolean;
  setIsShowingAnswer: (value: boolean) => void;
}

export interface ReviewStatistics {
  totalDeckCount: number;
  totalFlashcardCount: number;
  reviewedCount: number,
  dueTodayCount: number;
  percentReviewed: number;
  reviewsThisWeekCount: number;

  // Thêm cho pie chart
  newCount: number;
  learningCount: number;
  reviewingCount: number;
}

export interface DeckDueItem {
  deckTitle: string;
  dueTodayCount: number;
}
