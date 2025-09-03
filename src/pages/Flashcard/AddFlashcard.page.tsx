import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button.component';
import { useState } from 'react';
import { clearStates } from '../../utils/clear-state.util';
import flashcardService from '../../services/flashcard.service';
import { FlashcardForm } from '../../types/flashcard/flashcard.types';
import { useForm } from 'react-hook-form';
import { TextareaField } from '../../components/common/Input.component';
import { isNotEmpty } from '../../utils/validate.util';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function AddFlashcard() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { title } = location.state;
  const { t } = useAppTranslate('flashcard');

  const { handleSubmit, control, watch, reset } = useForm<FlashcardForm>();

  const onSubmit = async (data: FlashcardForm) => {
    try {
      console.log('Add flashcard:', { data });

      await flashcardService.createFlashcard({
        deck_id: deckId ? deckId : '',
        front: watch('front'),
        back: watch('back'),
      });

      reset(
        {
          front: '',
          back: '',
        },
        {
          keepErrors: false,
          keepDirty: false,
          keepTouched: false,
          keepIsValidating: true,
        }
      );
    } catch {
      navigate(`/flashcard-deck`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full h-full bg-white p-8 rounded-xl shadow-sm"
    >
      <h1
        className="text-xl mb-6"
        style={{ cursor: 'pointer', color: 'blue' }}
        onClick={() => navigate(-1)}
      >
        {t('back')}{' '}
      </h1>

      {/* Deck Info */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          {t('deck')}
        </label>
        <div className="bg-gray-100 p-3 rounded-md text-gray-700">{title}</div>
      </div>

      {/* Front Side */}
      <div className="mb-4">
        <TextareaField<FlashcardForm>
          name="front"
          control={control}
          label={t('front')}
          placeholder={t('enter_front_placeholder')}
          rules={{
            required: t('required_error'),
            minLength: {
              value: 1,
              message: t('min_length_error'),
            },
            setValueAs: v => v.trim(),
            validate: v => isNotEmpty(v) || t('whitespace_error'),
          }}
        />
      </div>

      {/* Back Side */}
      <div className="mb-6">
        <TextareaField<FlashcardForm>
          name="back"
          control={control}
          label={t('back')}
          placeholder={t('enter_back_placeholder')}
          rules={{
            required: t('required_error'),
            minLength: {
              value: 1,
              message: t('min_length_error'),
            },
            setValueAs: v => v.trim(),
            validate: v => isNotEmpty(v) || t('whitespace_error'),
          }}
        />
      </div>

      <Button title={t('add_flashcard')} className="w-full" inverted></Button>
    </form>
  );
}
