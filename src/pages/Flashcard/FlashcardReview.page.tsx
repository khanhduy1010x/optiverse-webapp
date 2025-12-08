import { useFlashcardReview } from '../../hooks/flashcard/useFlashcardReview.hook';
import { FlashcardChips } from '../../components/common/Chip.component';
import {
  Button,
  FlashcardButton,
} from '../../components/common/Button.component';
import COLORS from '../../constants/colors.constant';
import { useNavigate } from 'react-router-dom';
import Text from '../../components/common/Text.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function FlashcardReview() {
  const navigate = useNavigate();
  const { t } = useAppTranslate('flashcard');
  const {
    title,
    flashcardDeck,
    flashcard,
    showAnswer,
    setShowAnswer,
    handleReview,
  } = useFlashcardReview();

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen px-4 py-8 gap-4">
      <div className="w-1/2 flex justify-between items-center mb-6">
        <Button
          title={''}
          leftIcon="back"
          textSize={15}
          onClick={() => navigate(-1)}
          style={{ borderColor: 'transparent' }}
        ></Button>
      </div>

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
          <div className="w-1/2 mb-4">{t('congratulations_completed')}</div>
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
            <label className="block text-gray-700">{t('front')}</label>
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
                {t('back_label')}
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
                  difficulty={t('again')}
                  minutes={1}
                  onClick={() => handleReview(0)}
                  style={{ backgroundColor: COLORS.red500 }}
                  textStyle={{ color: COLORS.white900 }}
                />
                <FlashcardButton
                  difficulty={t('hard')}
                  minutes={6}
                  onClick={() => handleReview(1)}
                  style={{ backgroundColor: COLORS.yellow500 }}
                  textStyle={{ color: COLORS.white900 }}
                />
                <FlashcardButton
                  difficulty={t('good')}
                  minutes={20}
                  onClick={() => handleReview(2)}
                  style={{ backgroundColor: COLORS.green500 }}
                  textStyle={{ color: COLORS.white900 }}
                />
                <FlashcardButton
                  difficulty={t('easy')}
                  minutes={60}
                  onClick={() => handleReview(3)}
                  style={{ backgroundColor: COLORS.white900, borderWidth: 1, borderColor: COLORS.black500 }}
                  textStyle={{ color: COLORS.black500 }}
                />
              </div>
            )}

            {!showAnswer && (
              <div className="ml-4">
                <Button
                  title={t('show_answer')}
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
