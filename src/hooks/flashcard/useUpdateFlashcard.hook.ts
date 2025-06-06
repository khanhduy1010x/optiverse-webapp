import { useState } from 'react';
import { token } from '../../utils/apitest';
import { Flashcard } from '../../types/flashcard/response/flashcard.response';

export function useUpdateFlashcard(item: Flashcard, clear: () => void) {
  const [front, setFront] = useState(item.front);
  const [back, setBack] = useState(item.back);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Update flashcard:', { front, back });

    try {
      const response = await fetch(
        `http://localhost:81/productivity/flashcard/${item._id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ front, back }),
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
    front,
    back,
    setFront,
    setBack,
    handleSubmit,
  };
}
