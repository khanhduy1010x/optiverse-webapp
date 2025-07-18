import { useCallback } from 'react';
import streakService from '../../services/streak.service';

export const useFlashcardStreak = () => {
  const updateFlashcardStreak = useCallback(async () => {
    try {
      // Get current streak to compare later
      const currentStreak = await streakService.getUserStreak();
      const previousFlashcardStreak = currentStreak?.flashcardStreak || 0;
      
      // Update flashcard streak
      const updatedStreak = await streakService.updateFlashcardStreak();
      
      return updatedStreak;
    } catch (error) {
      // Error handling is done in the service
      return null;
    }
  }, []);

  return { updateFlashcardStreak };
}; 