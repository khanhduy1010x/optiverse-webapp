import { Button } from '../../components/common/Button.component';
import { useUpdateFlashcardDeck } from '../../hooks/flashcard/useUpdateFlashcardDeck.hook';
import { FlashcardDeckResponse } from '../../types/flashcard/response/flashcard.response';
import { TextareaField } from '../../components/common/Input.component';
import { isNotEmpty } from '../../utils/validate.util';
import { FlashcardDeckForm } from '../../types/flashcard/flashcard.types';

export default function UpdateFlashcardDeck({
  item,
  clear,
}: {
  item: FlashcardDeckResponse;
  clear: () => Promise<void>;
}) {
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
          label="Title"
          placeholder="Enter title..."
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

      <Button title="Update deck" className="w-full" inverted />
    </form>
  );
}
