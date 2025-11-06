import { useForm } from 'react-hook-form';
import { Button } from '../../components/common/Button.component';
import flashcardService from '../../services/flashcard.service';
import { FlashcardDeckForm } from '../../types/flashcard/flashcard.types';
import { TextareaField } from '../../components/common/Input.component';
import { isNotEmpty } from '../../utils/validate.util';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function AddFlashcardDeck({
  clear,
  workspaceId,
}: {
  clear: () => Promise<void>;
  workspaceId?: string;
}) {
  const { t } = useAppTranslate('flashcard');
  const { handleSubmit, control, watch } = useForm<FlashcardDeckForm>();

  const onSubmit = async (data: FlashcardDeckForm) => {
    console.log('Add:', { data, workspaceId });

    await flashcardService.createFlashcardDeck(watch('title'), workspaceId);

    await clear();
  };

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

      <Button title={t('create_deck')} className="w-full" inverted></Button>
    </form>
  );
}
