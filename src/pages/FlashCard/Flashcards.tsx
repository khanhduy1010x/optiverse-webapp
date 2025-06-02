import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flashcard, FlashcardDeckCard } from '../../components/common/Card';
import { CircleButton } from '../../components/common/Button';
import { token } from '../../services/apitest';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  review: any;
}

interface Deck {
  _id: string;
  title: string;
  lastReview: number;
  learningCount: number;
  newCount: number;
  reviewingCount: number;
}

export default function FlashcardsScreen() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [deck, setDeck] = useState<Deck>({
    _id: '',
    title: 'Loading',
    lastReview: 0,
    learningCount: 0,
    newCount: 0,
    reviewingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:81/productivity/flashcard-deck/${deckId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = (await response.json()).data;
      const deckData: Deck = {
        _id: result._id,
        title: result.title,
        lastReview: result.lastReview,
        learningCount: result.learningCount,
        newCount: result.newCount,
        reviewingCount: result.reviewingCount,
      };
      setDeck(deckData);

      const flashcardsData: Flashcard[] = result.flashcards;
      setFlashcards(flashcardsData);
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
    <div className="w-full max-w-2xl mx-auto p-4 pb-8 flex flex-col gap-4">
      <h1
        className="text-xl mb-6"
        style={{ cursor: 'pointer', color: 'blue' }}
        onClick={() => navigate(-1)}
      >
        Back{' '}
      </h1>

      {/* Deck Header */}
      <FlashcardDeckCard
        title={deck.title}
        lastReview={deck.lastReview}
        learningFlashcard={deck.learningCount}
        newFlashcard={deck.newCount}
        reviewingFlashcard={deck.reviewingCount}
      ></FlashcardDeckCard>

      {/* Cards section */}
      <div className="flex-col flex gap-8">
        <h3 className="text-lg">Flashcards</h3>

        {flashcards.map(item => (
          <Flashcard
            key={item._id}
            front={item.front}
            back={item.back}
          ></Flashcard>
        ))}
      </div>

      {/* Bottom border/shadow */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gray-300"></div>

      <CircleButton
        name="add"
        onClick={() =>
          navigate(`/flashcard-deck/${deck._id}/add`, {
            state: {
              title: deck.title,
            },
          })
        }
      ></CircleButton>
    </div>
  );
}
