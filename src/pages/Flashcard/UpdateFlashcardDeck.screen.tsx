import React from 'react';
import { FlashcardDeck } from '../../types/flashcard/response/flashcard.response';
import { Button } from '../../components/common/Button.component';
import { useUpdateFlashcardDeck } from '../../hooks/flashcard/useUpdateFlashcardDeck.hook';

export default function UpdateFlashcardDeck({
  item,
  clear,
}: {
  item: FlashcardDeck;
  clear: () => void;
}) {
  const { title, setTitle, handleSubmit } = useUpdateFlashcardDeck(item, clear);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-full bg-white p-8 rounded-xl shadow-sm"
    >
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">Title</label>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Enter the title"
          onChange={e => setTitle(e.target.value)}
          value={title}
        />
      </div>

      <Button title="Update deck" className="w-full" />
    </form>
  );
}
