import { useEffect, useState, useRef } from 'react';
import streakService from '../../services/streak.service';
import { StreakResponse } from '../../types/streak/streak.types';
import { useAuthStatus } from '../auth/useAuthStatus.hook';

export const useLoginStreak = () => {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const [streak, setStreak] = useState<StreakResponse | null>(null);
  const previousStreakRef = useRef<number | null>(null);
  const hasCheckedRef = useRef<boolean>(false);

  useEffect(() => {
    const checkAndUpdateStreak = async () => {
      if (!isAuthenticated || isLoading || hasCheckedRef.current) return;

      try {
        // Mark as checked to prevent multiple calls
        hasCheckedRef.current = true;
        
        // First get current streak to store the previous value
        const currentStreak = await streakService.getUserStreak();
        if (currentStreak) {
          previousStreakRef.current = currentStreak.loginStreak || 0;
        }

        // Update login streak
        const updatedStreak = await streakService.updateLoginStreak();
        
        if (updatedStreak) {
          setStreak(updatedStreak);
        }
      } catch (error) {
        // Error handling is done in the service
      }
    };

    // Only run once when the user is authenticated and not loading
    if (isAuthenticated && !isLoading) {
      checkAndUpdateStreak();
    }
  }, [isAuthenticated, isLoading]);

  return { streak };
};