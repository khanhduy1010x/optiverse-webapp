import React from 'react';
import { Button } from '../../components/common/Button.component';
import { useUpdateFlashcard } from '../../hooks/flashcard/useUpdateFlashcard.hook';
import { FlashcardResponse } from '../../types/flashcard/response/flashcard.response';
import { TextareaField } from '../../components/common/Input.component';
import { FlashcardForm } from '../../types/flashcard/flashcard.types';
import { isNotEmpty } from '../../utils/validate.util';

export default function UpdateFlashcard({
  item,
  clear,
}: {
  item: FlashcardResponse;
  clear: () => Promise<void>;
}) {
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
          label="Front"
          placeholder="Enter front..."
          rules={{
            required: 'must be required',
            minLength: {
              value: 10,
              message: 'at least 10 characters',
            },
            setValueAs: v => v.trim(),
            validate: v => isNotEmpty(v) || 'must not be only white space',
          }}
        />
      </div>

      <div className="mb-6">
        <TextareaField<FlashcardForm>
          name="back"
          control={control}
          label="Back"
          placeholder="Enter back..."
          rules={{
            required: 'must be required',
            minLength: {
              value: 10,
              message: 'at least 10 characters',
            },
            setValueAs: v => v.trim(),
            validate: v => isNotEmpty(v) || 'must not be only white space',
          }}
        />
      </div>

      <Button title="Update flashcard" className="w-full" inverted />
    </form>
  );
}
