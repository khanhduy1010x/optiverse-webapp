import { useState } from 'react';
import { token } from '../../utils/apitest';
import { Button } from '../../components/common/Button.component';
import { FlashcardDeck } from '../../types/flashcard/response/flashcard.response';


export default function UpdateFlashcardDeck({
  item,
  clear,
}: {
  item: FlashcardDeck;
  clear: () => void;
}) {
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
          body: JSON.stringify({
            title: title,
          }),
        }
      );

      const result = (await response.json()).data;
      console.log(result);
      await clear();
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
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

      <Button title="Update deck" className="w-full"></Button>
    </form>
  );
}
