import React from 'react';
import { Button } from '../../components/common/Button.component';
import { useUpdateFlashcard } from '../../hooks/flashcard/useUpdateFlashcard.hook';
import { FlashcardResponse } from '../../types/flashcard/response/flashcard.response';
import { TextareaField } from '../../components/common/Input.component';
import { FlashcardForm } from '../../types/flashcard/flashcard.types';
import { isNotEmpty } from '../../utils/validate.util';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function UpdateFlashcard({
  item,
  clear,
}: {
  item: FlashcardResponse;
  clear: () => Promise<void>;
}) {
  const { t } = useAppTranslate('flashcard');
  const { onSubmit, control, handleSubmit } = useUpdateFlashcard(item, clear);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full h-full bg-white p-8 rounded-xl shadow-sm"
    >
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

      <div className="mb-6">
        <TextareaField<FlashcardForm>
          name="back"
          control={control}
          label={t('back_label')}
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

      <Button title={t('update_flashcard')} className="w-full" inverted />
    </form>
  );
}
