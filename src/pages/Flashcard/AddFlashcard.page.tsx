import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button.component';
import { useState } from 'react';
import { token } from '../../utils/apitest';

export default function AddFlashcard() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { title } = location.state;
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Add flashcard:', { front, back });

    try {
      const response = await fetch(
        `http://localhost:81/productivity/flashcard`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            deck_id: deckId,
            front: front,
            back: back,
          }),
        }
      );

      const result = (await response.json()).data;
      console.log(result);
      clear();
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    } 
  };

  const clear = () => {
    setFront('');
    setBack('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-full bg-white p-8 rounded-xl shadow-sm"
    >
      <h1
        className="text-xl mb-6"
        style={{ cursor: 'pointer', color: 'blue' }}
        onClick={() => navigate(-1)}
      >
        Back{' '}
      </h1>

      {/* Deck Info */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Deck</label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-700">{title}</div>
      </div>

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

      <Button title="Add flashcard" className="w-full"></Button>
    </form>
  );
}
