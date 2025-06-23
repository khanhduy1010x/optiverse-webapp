import { useState, useEffect } from 'react';
import { Achievement, UserAchievementWithDetails } from '../../types/achievement/achievement.type';
import achievementService from '../../services/achievement.service';
import { useNavigate } from 'react-router-dom';

export const useAchievements = () => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievementWithDetails[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<string>('achievements');
  const navigate = useNavigate();

  const handleNavigate = (menu: string, path: string) => {
    setSelectedMenu(menu);
    navigate(path);
  };

  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch unlocked achievements (đã đạt được)
      console.log('Fetching unlocked achievements...');
      const userAchievements = await achievementService.getUnlockedAchievements();
      console.log('Processed unlocked achievements:', userAchievements);
      setUnlockedAchievements(userAchievements);

      // Fetch locked achievements (chưa đạt được)
      console.log('Fetching locked achievements...');
      const locked = await achievementService.getLockedAchievements();
      console.log('Processed locked achievements:', locked);
      setLockedAchievements(locked);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const refreshAchievements = () => {
    fetchAchievements();
  };

  return {
    unlockedAchievements,
    lockedAchievements,
    loading,
    error,
    selectedMenu,
    handleNavigate,
    refreshAchievements
  };
};

export default useAchievements; 