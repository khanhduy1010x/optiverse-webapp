import { useForm } from 'react-hook-form';
import { Button } from '../../components/common/Button.component';
import flashcardService from '../../services/flashcard.service';
import { FlashcardDeckForm } from '../../types/flashcard/flashcard.types';
import { TextareaField } from '../../components/common/Input.component';
import { isNotEmpty } from '../../utils/validate.util';

export default function AddFlashcardDeck({
  clear,
}: {
  clear: () => Promise<void>;
}) {
  const { handleSubmit, control, watch } = useForm<FlashcardDeckForm>();

  const onSubmit = async (data: FlashcardDeckForm) => {
    console.log('Add:', { data });

    await flashcardService.createFlashcardDeck(watch('title'));

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
          label="Title"
          placeholder="Enter title..."
          rules={{
            required: 'must be required',
            minLength: {
              value: 1,
              message: 'at least 1 characters',
            },
            setValueAs: v => v.trim(),
            validate: v => isNotEmpty(v) || 'must not be only white space',
          }}
        />
      </div>

      <Button title="Create deck" className="w-full" inverted></Button>
    </form>
  );
}
