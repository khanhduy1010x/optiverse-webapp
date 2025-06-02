import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface FlashcardDeck {
  _id: string;
  title: string;
  imageUrl?: string;
  lastReviewedAt?: string;
  newCount: number;
  learningCount: number;
  reviewingCount: number;
}

export default function ManageFlashCardDeck() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockData: FlashcardDeck[] = [
      {
        _id: '1',
        title: '400 English Words',
        imageUrl: 'https://via.placeholder.com/150',
        lastReviewedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        newCount: 50,
        learningCount: 20,
        reviewingCount: 10,
      },
      {
        _id: '2',
        title: '400 English Words',
        imageUrl: 'https://via.placeholder.com/150',
        lastReviewedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        newCount: 50,
        learningCount: 20,
        reviewingCount: 10,
      },
      {
        _id: '3',
        title: '400 English Words',
        imageUrl: 'https://via.placeholder.com/150',
        lastReviewedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        newCount: 50,
        learningCount: 20,
        reviewingCount: 10,
      },
    ];

    setTimeout(() => {
      setDecks(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const formatDateDiff = (dateStr?: string): string => {
    if (!dateStr) return 'Never reviewed';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Today' : `${diff} day${diff > 1 ? 's' : ''} ago`;
  };

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
          {decks.map((deck) => (
            <div
              key={deck._id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4"
            >
              {/* Image */}
              <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                {deck.imageUrl ? (
                  <img
                    src={deck.imageUrl}
                    alt="Deck"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg text-gray-900 truncate">{deck.title}</h2>
                <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Last review {formatDateDiff(deck.lastReviewedAt)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="bg-red-700 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {deck.newCount} New
                  </span>
                  <span className="bg-green-700 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {deck.learningCount} Learning
                  </span>
                  <span className="bg-yellow-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {deck.reviewingCount} Reviewing
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
