import { useState } from 'react';
import { FlashcardResponse } from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';

export function useUpdateFlashcard(
  item: FlashcardResponse,
  clear: () => Promise<void>
) {
  const [front, setFront] = useState(item.front);
  const [back, setBack] = useState(item.back);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Update flashcard:', { front, back });

    await flashcardService.updateFlashcard({
      _id: item._id,
      front,
      back,
    });

    await clear();
  };

  return {
    front,
    back,
    setFront,
    setBack,
    handleSubmit,
  };
}
