import { useCallback } from 'react';
import AchievementService from '../../services/achievement.service';

interface UseAchievementEvaluationReturn {
  evaluateAchievements: () => Promise<void>;
}

/**
 * Hook để quản lý việc đánh giá achievements và hiển thị thông báo
 */
export const useAchievementEvaluation = (): UseAchievementEvaluationReturn => {
  
  const evaluateAchievements = useCallback(async () => {
    try {
      await AchievementService.evaluateAchievements();
    } catch (error) {
      console.error('Error evaluating achievements:', error);
      // Có thể thêm error handling hoặc toast error ở đây nếu cần
    }
  }, []);

  return {
    evaluateAchievements
  };
};