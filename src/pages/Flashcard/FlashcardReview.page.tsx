import { useFlashcardReview } from '../../hooks/flashcard/useFlashcardReview.hook';
import { FlashcardChips } from '../../components/common/Chip.component';
import {
  Button,
  FlashcardButton,
} from '../../components/common/Button.component';
import COLORS from '../../constants/colors.constant';

export default function FlashcardReview() {
  const {
    title,
    flashcardDeck,
    flashcard,
    showAnswer,
    setShowAnswer,
    handleReview,
  } = useFlashcardReview();

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>

      <div className="w-1/2 flex flex-row">
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
            value={flashcard.front}
            readOnly
          />
        </div>
      )}

      {flashcardDeck.flashcards?.length !== 0 && showAnswer && (
        <>
          <div className="w-1/2 mb-6">
            <label className="block text-gray-700 font-medium mb-1">Back</label>
            <textarea
              className="w-full p-3 border rounded-md"
              value={flashcard.back}
              readOnly
            />
          </div>

          <div className="w-1/2 flex justify-between">
            <FlashcardButton
              difficulty="Again"
              minutes={1}
              onClick={() => handleReview(0)}
              style={{ backgroundColor: COLORS.red500 }}
            />
            <FlashcardButton
              difficulty="Hard"
              minutes={6}
              onClick={() => handleReview(1)}
              style={{ backgroundColor: COLORS.yellow500 }}
            />
            <FlashcardButton
              difficulty="Good"
              minutes={20}
              onClick={() => handleReview(2)}
              style={{ backgroundColor: COLORS.green500 }}
            />
            <FlashcardButton
              difficulty="Easy"
              minutes={60}
              onClick={() => handleReview(3)}
            />
          </div>
        </>
      )}

      {flashcardDeck.flashcards?.length !== 0 && !showAnswer && (
        <Button
          title="Show Answer"
          className="w-1/2"
          onClick={() => setShowAnswer(true)}
        />
      )}
    </div>
  );
}
