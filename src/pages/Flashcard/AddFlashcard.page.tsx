import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button.component';
import { useState } from 'react';
import { clearStates } from '../../utils/clear-state.util';
import flashcardService from '../../services/flashcard.service';

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

    await flashcardService.createFlashcard({
      deck_id: deckId ? deckId : '',
      front: front,
      back: back,
    });

    clear();
  };

  const clear = () => {
    clearStates([
      [setFront, ''],
      [setBack, ''],
    ]);
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
