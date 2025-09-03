import { Button } from '../../components/common/Button.component';
import { useUpdateFlashcardDeck } from '../../hooks/flashcard/useUpdateFlashcardDeck.hook';
import { FlashcardDeckResponse } from '../../types/flashcard/response/flashcard.response';
import { TextareaField } from '../../components/common/Input.component';
import { isNotEmpty } from '../../utils/validate.util';
import { FlashcardDeckForm } from '../../types/flashcard/flashcard.types';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function UpdateFlashcardDeck({
  item,
  clear,
}: {
  item: FlashcardDeckResponse;
  clear: () => Promise<void>;
}) {
  const { t } = useAppTranslate('flashcard');
  const { control, onSubmit, handleSubmit } = useUpdateFlashcardDeck(
    item,
    clear
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full h-full bg-white p-8 rounded-xl shadow-sm"
    >
      <div className="mb-6">
        <TextareaField<FlashcardDeckForm>
          name="title"
          control={control}
          label={t('title_label')}
          placeholder={t('enter_title_placeholder')}
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

      <Button title={t('update_deck')} className="w-full" inverted />
    </form>
  );
}
