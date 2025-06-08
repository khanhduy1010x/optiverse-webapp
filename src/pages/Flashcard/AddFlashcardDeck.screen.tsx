import { useState } from 'react';
import { Button } from '../../components/common/Button.component';
import flashcardService from '../../services/flashcard.service';

export default function AddFlashcardDeck({
  clear,
}: {
  clear: () => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Add:', { title });

    flashcardService.createFlashcardDeck(title);
    await clear();
  };

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

      <Button title="Create deck" className="w-full"></Button>
    </form>
  );
}
