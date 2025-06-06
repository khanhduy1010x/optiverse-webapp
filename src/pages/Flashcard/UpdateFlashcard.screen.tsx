import { useState } from 'react';
import { token } from '../../services/apitest';
import { Button } from '../../components/common/Button';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  review: any;
}

export default function UpdateFlashcard({
  item,
  clear,
}: {
  item: Flashcard;
  clear: () => void;
}) {
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
          body: JSON.stringify({
            front: front,
            back: back,
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
      {/* Front Side */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Front</label>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Enter the front side content..."
          onChange={e => setFront(e.target.value)}
          value={front}
        />
      </div>

      {/* Back Side */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">Back</label>
        <textarea
          className="w-full p-3 border rounded-md"
          placeholder="Enter the back side content..."
          onChange={e => setBack(e.target.value)}
          value={back}
        />
      </div>

      <Button title="Update flashcard" className="w-full"></Button>
    </form>
  );
}
