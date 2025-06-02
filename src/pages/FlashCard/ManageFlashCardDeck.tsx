import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { FlashcardDeckCard } from '../../components/common/Card';
import { useNavigate } from 'react-router-dom';
import { token } from '../../services/apitest';

interface Deck {
  _id: string;
  title: string;
  lastReview: number;
  learningCount: number;
  newCount: number;
  reviewingCount: number;
}

export default function ManageFlashCardDeck() {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:81/productivity/flashcard-deck/all`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result: Deck[] = (await response.json()).data;
      console.log(result);
      setDecks(result);
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Flashcard decks</h1>
        <button
          type="button"
          title="More options"
          className="text-gray-600 hover:text-black focus:outline-none"
        >
          <svg width="24" height="24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading decks...</p>
      ) : decks.length === 0 ? (
        <p className="text-gray-500">No flashcard decks found.</p>
      ) : (
        <div className="space-y-4">
          {decks.map(deck => (
            <FlashcardDeckCard
              title={deck.title}
              lastReview={deck.lastReview}
              learningFlashcard={deck.learningCount}
              newFlashcard={deck.newCount}
              reviewingFlashcard={deck.reviewingCount}
              onClick={() => navigate(`/flashcard-deck/${deck._id}`)}
            ></FlashcardDeckCard>
          ))}
        </div>
      )}
    </div>
  );
}
