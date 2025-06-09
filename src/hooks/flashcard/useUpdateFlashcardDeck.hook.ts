import { FlashcardDeckResponse } from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';
import { useForm } from 'react-hook-form';
import { FlashcardDeckForm } from '../../types/flashcard/flashcard.types';

export function useUpdateFlashcardDeck(
  item: FlashcardDeckResponse,
  clear: () => Promise<void>
) {
  const { handleSubmit, control, watch } = useForm<FlashcardDeckForm>({
    values: {
      title: item.title,
    },
  });

  const onSubmit = async (data: FlashcardDeckForm) => {
    console.log('Update:', { data });

    await flashcardService.updateFlashcardDeck({
      _id: item._id,
      title: watch('title'),
    });

    await clear();
  };

  return {
    control,
    onSubmit,
    handleSubmit,
  };
}
