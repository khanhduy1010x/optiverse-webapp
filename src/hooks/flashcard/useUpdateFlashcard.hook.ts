import { FlashcardResponse } from '../../types/flashcard/response/flashcard.response';
import flashcardService from '../../services/flashcard.service';
import { FlashcardForm } from '../../types/flashcard/flashcard.types';
import { useForm } from 'react-hook-form';

export function useUpdateFlashcard(
  item: FlashcardResponse,
  clear: () => Promise<void>
) {
  const { handleSubmit, control, watch } = useForm<FlashcardForm>({
    values: {
      front: item.front,
      back: item.back,
    },
  });

  const onSubmit = async (data: FlashcardForm) => {
    console.log('Update flashcard:', { data });

    await flashcardService.updateFlashcard({
      _id: item._id,
      front: watch('front'),
      back: watch('back'),
    });

    await clear();
  };

  return {
    onSubmit,
    control,
    handleSubmit,
  };
}
