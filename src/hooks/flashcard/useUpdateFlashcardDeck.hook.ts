import { useState } from 'react';
import { token } from '../../utils/apitest';
import { FlashcardDeck } from '../../types/flashcard/response/flashcard.response';

export function useUpdateFlashcardDeck(item: FlashcardDeck, clear: () => void) {
  const [title, setTitle] = useState(item.title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Update:', { title });

    try {
      const response = await fetch(
        `http://localhost:81/productivity/flashcard-deck/${item._id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        }
      );

      const result = (await response.json()).data;
      console.log(result);
      await clear();
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
  };

  return {
    title,
    setTitle,
    handleSubmit,
  };
}
