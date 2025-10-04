import { useState, useEffect, useCallback } from 'react';
import userAchievementService from '../../services/user-achievement.service';
import { UserAchievement, UserAchievementState } from '../../types/user-achievement/user-achievement.types';

export function useUserAchievement() {
  const [state, setState] = useState<UserAchievementState>({
    unlockedAchievements: [],
    lockedAchievements: [],
    loading: false,
    error: null,
  });

  const [refreshing, setRefreshing] = useState(false);

  // Fetch all achievements (both unlocked and locked)
  const fetchAllAchievements = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { unlocked, locked } = await userAchievementService.getAllAchievements();

      setState(prev => ({
        ...prev,
        unlockedAchievements: unlocked.achievements,
        lockedAchievements: locked.achievements,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Có lỗi xảy ra khi tải danh sách thành tựu',
      }));
    }
  }, []);

  // Fetch only unlocked achievements
  const fetchUnlockedAchievements = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await userAchievementService.getUnlockedAchievements();

      setState(prev => ({
        ...prev,
        unlockedAchievements: response.achievements,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error fetching unlocked achievements:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Có lỗi xảy ra khi tải danh sách thành tựu đã đạt',
      }));
    }
  }, []);

  // Fetch only locked achievements
  const fetchLockedAchievements = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await userAchievementService.getLockedAchievements();

      setState(prev => ({
        ...prev,
        lockedAchievements: response.achievements,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error fetching locked achievements:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Có lỗi xảy ra khi tải danh sách thành tựu chưa đạt',
      }));
    }
  }, []);

  // Refresh all achievements
  const refreshAchievements = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchAllAchievements();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAllAchievements]);

  // Get achievement by ID
  const getAchievementById = useCallback(async (id: string): Promise<UserAchievement | null> => {
    try {
      const achievement = await userAchievementService.getUserAchievementById(id);
      return achievement;
    } catch (error: any) {
      console.error('Error fetching achievement by id:', error);
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Get total counts
  const getTotalCounts = useCallback(() => {
    return {
      totalUnlocked: state.unlockedAchievements.length,
      totalLocked: state.lockedAchievements.length,
      totalAchievements: state.unlockedAchievements.length + state.lockedAchievements.length,
    };
  }, [state.unlockedAchievements.length, state.lockedAchievements.length]);

  // Get completion percentage
  const getCompletionPercentage = useCallback(() => {
    const { totalUnlocked, totalAchievements } = getTotalCounts();
    return totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0;
  }, [getTotalCounts]);

  // Initialize data on mount
  useEffect(() => {
    fetchAllAchievements();
  }, [fetchAllAchievements]);

  return {
    // State
    unlockedAchievements: state.unlockedAchievements,
    lockedAchievements: state.lockedAchievements,
    loading: state.loading,
    error: state.error,
    refreshing,

    // Actions
    fetchAllAchievements,
    fetchUnlockedAchievements,
    fetchLockedAchievements,
    refreshAchievements,
    getAchievementById,
    clearError,

    // Computed values
    getTotalCounts,
    getCompletionPercentage,
  };
}