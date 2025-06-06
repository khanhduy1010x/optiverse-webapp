import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FlashcardChips } from '../../components/common/Chip.component';
import { getDueFlashcards } from '../../services/flashcardService';
import { Flashcard, FlashcardDeck, FlashcardMock, initFlashcardDeckMock } from '../../types/flashcard/response/flashcard.response';
import { token } from '../../utils/apitest';
import { Button, FlashcardButton } from '../../components/common/Button.component';
import COLORS from '../../constants/colors.constant';


export default function FlashcardView() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { title } = location.state;
  const [flashcardDeck, setFlashcardDeck] =
    useState<FlashcardDeck>(initFlashcardDeckMock);
  const [flashcard, setFlashcard] = useState<Flashcard>(FlashcardMock);
  const [showAnswer, setShowAnswer] = useState(false);

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

      const data = (await response.json()).data;
      if (data.flashcards) {
        const learnFlashcards = getDueFlashcards(data.flashcards);
        data.flashcards = [...learnFlashcards];
        if (data.flashcards.length > 0) {
          setFlashcard(data.flashcards[0]);
        }
      }

      setFlashcardDeck(data);
    } catch (error) {
      console.error('Failed to fetch deck:', error);
    } finally {
      setShowAnswer(false);
    }
  };

  const handleReview = async (quality: number) => {
    try {
      const response = await fetch(
        `http://localhost:81/productivity/review-session/review`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flashcard_id: flashcard._id,
            quality: quality,
          }),
        }
      );

      const data = (await response.json()).data;

      console.log(data);
    } catch (error) {
      console.error('Failed to review flashcard:', error);
    } finally {
      await fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-gray-100">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      {/* Status tags */}
      <div className="w-1/2" style={{ display: 'flex', flexDirection: 'row' }}>
        <FlashcardChips
          newFlashcard={flashcardDeck.newCount}
          learningFlashcard={flashcardDeck.learningCount}
          reviewingFlashcard={flashcardDeck.reviewingCount}
        />
      </div>

      {flashcardDeck.flashcards?.length !== 0 && (
        <div className="w-1/2 mb-4">
          <label className="block text-gray-700 font-medium mb-1">Front</label>
          <textarea
            className="w-full p-3 border rounded-md"
            placeholder="Enter the front side content..."
            value={flashcard.front}
            contentEditable={false}
            readOnly={true}
          />
        </div>
      )}

      {flashcardDeck.flashcards?.length !== 0 && showAnswer && (
        <>
          {/* Back Side */}
          <div className="w-1/2 mb-6">
            <label className="block text-gray-700 font-medium mb-1">Back</label>
            <textarea
              className="w-full p-3 border rounded-md"
              placeholder="Enter the back side content..."
              value={flashcard.back}
              contentEditable={false}
              readOnly={true}
            />
          </div>
        </>
      )}

      {flashcardDeck.flashcards?.length !== 0 && showAnswer && (
        <div className="w-1/2 flex justify-between">
          <FlashcardButton
            difficulty={'Again'}
            minutes={1}
            onClick={() => handleReview(0)}
            style={{ backgroundColor: COLORS.red500 }}
          ></FlashcardButton>
          <FlashcardButton
            difficulty={'Hard'}
            minutes={6}
            onClick={() => handleReview(1)}
            style={{ backgroundColor: COLORS.yellow500 }}
          ></FlashcardButton>
          <FlashcardButton
            difficulty={'Good'}
            minutes={20}
            onClick={() => handleReview(2)}
            style={{ backgroundColor: COLORS.green500 }}
          ></FlashcardButton>
          <FlashcardButton
            difficulty={'Easy'}
            minutes={60}
            onClick={() => handleReview(3)}
          ></FlashcardButton>
        </div>
      )}

      {flashcardDeck.flashcards?.length !== 0 && !showAnswer && (
        <>
          <Button
            title="Show Answer"
            className="w-1/2"
            onClick={() => setShowAnswer(true)}
          ></Button>
        </>
      )}
    </div>
  );
}
