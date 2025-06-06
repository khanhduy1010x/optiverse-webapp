import React from 'react';
import { Flashcard } from '../../types/flashcard/response/flashcard.response';
import { Button } from '../../components/common/Button.component';
import { useUpdateFlashcard } from '../../hooks/flashcard/useUpdateFlashcard.hook';

export default function UpdateFlashcard({
  item,
  clear,
}: {
  item: Flashcard;
  clear: () => void;
}) {
  const { front, back, setFront, setBack, handleSubmit } = useUpdateFlashcard(
    item,
    clear
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-full bg-white p-8 rounded-xl shadow-sm"
    >
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Front</label>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Enter the front side content..."
          onChange={e => setFront(e.target.value)}
          value={front}
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">Back</label>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Enter the back side content..."
          onChange={e => setBack(e.target.value)}
          value={back}
        />
      </div>

      <Button title="Update flashcard" className="w-full" />
    </form>
  );
}
