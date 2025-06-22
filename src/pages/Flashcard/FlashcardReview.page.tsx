import { useFlashcardReview } from '../../hooks/flashcard/useFlashcardReview.hook';
import { FlashcardChips } from '../../components/common/Chip.component';
import {
  Button,
  FlashcardButton,
} from '../../components/common/Button.component';
import COLORS from '../../constants/colors.constant';
import { useNavigate } from 'react-router-dom';
import Text from '../../components/common/Text.component';

export default function FlashcardReview() {
  const navigate = useNavigate();
  const {
    title,
    flashcardDeck,
    flashcard,
    showAnswer,
    setShowAnswer,
    handleReview,
  } = useFlashcardReview();

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen px-4 py-8 bg-gray-100 gap-4">
      <h1
        className="w-1/2 text-xl mb-6 text-blue-600 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        Back
      </h1>

      <h1 className="text-2xl font-bold">{title}</h1>

      <div className="w-1/2 flex flex-row">
        <FlashcardChips
          newFlashcard={flashcardDeck.newCount}
          learningFlashcard={flashcardDeck.learningCount}
          reviewingFlashcard={flashcardDeck.reviewingCount}
        />
      </div>

      <div className="w-full flex flex-col justify-center items-center">
        {flashcardDeck.flashcards?.length === 0 && (
          <div className="w-1/2 mb-4">
            Congratulations, you have completed all the flashcards!
          </div>
        )}

        {flashcardDeck.flashcards?.length !== 0 && (
          <div
            className="w-1/2 flex flex-col gap-4"
            style={{
              backgroundColor: 'transparent',
              padding: 8,
              borderRadius: 8,
            }}
          >
            <label className="block text-gray-700">Front</label>
            <Text className="w-full p-3 border rounded-md">
              {flashcard.front}
            </Text>
          </div>
        )}

        {flashcardDeck.flashcards?.length !== 0 && showAnswer && (
          <>
            <div
              className="w-1/2 flex flex-col gap-4"
              style={{
                backgroundColor: 'transparent',
                padding: 8,
                borderRadius: 8,
              }}
            >
              <label className="block text-gray-700 font-medium mb-1">
                Back
              </label>
              <Text className="w-full p-3 border rounded-md">
                {flashcard.back}
              </Text>
            </div>
          </>
        )}

        {flashcardDeck.flashcards?.length !== 0 && (
          <div className="fixed w-40 top-1/2 left-3/4 -translate-y-1/2 z-10-md px-3 text-sm flex flex-col items-center justify-center space-y-1">
            {showAnswer && (
              <div className="flex flex-col justify-center items-center gap-4">
                <FlashcardButton
                  difficulty="Again"
                  minutes={1}
                  onClick={() => handleReview(0)}
                  style={{ backgroundColor: COLORS.red500 }}
                  textStyle={{ color: COLORS.white900 }}
                />
                <FlashcardButton
                  difficulty="Hard"
                  minutes={6}
                  onClick={() => handleReview(1)}
                  style={{ backgroundColor: COLORS.yellow500 }}
                  textStyle={{ color: COLORS.white900 }}
                />
                <FlashcardButton
                  difficulty="Good"
                  minutes={20}
                  onClick={() => handleReview(2)}
                  style={{ backgroundColor: COLORS.green500 }}
                  textStyle={{ color: COLORS.white900 }}
                />
                <FlashcardButton
                  difficulty="Easy"
                  minutes={60}
                  onClick={() => handleReview(3)}
                  style={{ backgroundColor: COLORS.white900 }}
                  textStyle={{ color: COLORS.black500 }}
                />
              </div>
            )}

            {!showAnswer && (
              <div className='ml-4'>
                <Button
                  title="Show Answer"
                  className="w-full"
                  onClick={() => setShowAnswer(true)}
                  inverted
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
