import React from 'react';
import { Flashcard, FlashcardDeck } from '../response/flashcard.response';

export interface FlashcardDeckListProps {
  decks: FlashcardDeck[];
  onAddDeck: () => void;
  onSelectDeck: (deck: FlashcardDeck) => void;
  onDeleteDeck: (id: string) => void;
  onEditDeck: (deck: FlashcardDeck) => void;
}

export interface FlashcardDeckItemProps {
  deck: FlashcardDeck;
  onSelect: (deck: FlashcardDeck) => void;
  onDelete: (id: string) => void;
  onEdit: (deck: FlashcardDeck) => void;
}

export interface FlashcardListProps {
  deck: FlashcardDeck;
  flashcards: Flashcard[];
  onAddFlashcard: () => void;
  onEditFlashcard: (flashcard: Flashcard) => void;
  onDeleteFlashcard: (id: string) => void;
  onStartReview: () => void;
}

export interface FlashcardItemProps {
  flashcard: Flashcard;
  onEdit: (flashcard: Flashcard) => void;
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
  flashcard: Flashcard;
  onAnswer: (quality: number) => void;
  isShowingAnswer: boolean;
  setIsShowingAnswer: (value: boolean) => void;
}
