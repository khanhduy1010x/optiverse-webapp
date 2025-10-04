import { useCallback } from 'react';
import streakService from '../../services/streak.service';

export const useTaskStreak = () => {
  const updateTaskStreak = useCallback(async () => {
    try {
      // Get current streak to compare later
      const currentStreak = await streakService.getUserStreak();
      const previousTaskStreak = currentStreak?.taskStreak || 0;
      
      // Update task streak
      const updatedStreak = await streakService.updateTaskStreak();
      
      return updatedStreak;
    } catch (error) {
      // Error handling is done in the service
      return null;
    }
  }, []);

  return { updateTaskStreak };
};