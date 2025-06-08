import { useState } from 'react';
import { FlashcardDeckResponse } from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';

export function useUpdateFlashcardDeck(
  item: FlashcardDeckResponse,
  clear: () => Promise<void>
) {
  const [title, setTitle] = useState(item.title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Update:', { title });

    await flashcardService.updateFlashcardDeck({
      _id: item._id,
      title: title,
    });

    await clear();
  };

  return {
    title,
    setTitle,
    handleSubmit,
  };
}
