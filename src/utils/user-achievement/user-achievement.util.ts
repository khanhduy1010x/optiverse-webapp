import { UserAchievement } from '../../types/user-achievement/user-achievement.types';

/**
 * Tính toán phần trăm hoàn thành achievements
 * @param unlockedCount - Số lượng achievements đã mở khóa
 * @param totalCount - Tổng số achievements
 * @returns Phần trăm hoàn thành (0-100)
 */
export const calculateCompletionPercentage = (
  unlockedCount: number,
  totalCount: number
): number => {
  if (totalCount === 0) return 0;
  return Math.round((unlockedCount / totalCount) * 100);
};

/**
 * Kiểm tra xem achievement có được mở khóa hay không
 * @param achievement - Achievement object
 * @returns true nếu đã mở khóa, false nếu chưa
 */
export const isAchievementUnlocked = (achievement: UserAchievement): boolean => {
  return achievement.unlocked_at !== null && achievement.unlocked_at !== undefined;
};

/**
 * Lọc achievements theo trạng thái
 * @param achievements - Danh sách achievements
 * @param filter - Loại filter: 'all' | 'unlocked' | 'locked'
 * @returns Danh sách achievements đã lọc
 */
export const filterAchievements = (
  achievements: UserAchievement[],
  filter: 'all' | 'unlocked' | 'locked'
): UserAchievement[] => {
  if (filter === 'all') return achievements;
  
  return achievements.filter(achievement => {
    const isUnlocked = isAchievementUnlocked(achievement);
    return filter === 'unlocked' ? isUnlocked : !isUnlocked;
  });
};

/**
 * Tìm kiếm achievements theo title hoặc description
 * @param achievements - Danh sách achievements
 * @param searchTerm - Từ khóa tìm kiếm
 * @returns Danh sách achievements phù hợp
 */
export const searchAchievements = (
  achievements: UserAchievement[],
  searchTerm: string
): UserAchievement[] => {
  if (!searchTerm.trim()) return achievements;
  
  const lowerSearchTerm = searchTerm.toLowerCase().trim();
  
  return achievements.filter(achievement => 
    achievement.achievement.title.toLowerCase().includes(lowerSearchTerm) ||
    achievement.achievement.description.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Sắp xếp achievements theo thời gian mở khóa (mới nhất trước)
 * @param achievements - Danh sách achievements
 * @returns Danh sách achievements đã sắp xếp
 */
export const sortAchievementsByUnlockedDate = (
  achievements: UserAchievement[]
): UserAchievement[] => {
  return [...achievements].sort((a, b) => {
    // Achievements chưa mở khóa sẽ ở cuối
    if (!a.unlocked_at && !b.unlocked_at) return 0;
    if (!a.unlocked_at) return 1;
    if (!b.unlocked_at) return -1;
    
    // Sắp xếp theo thời gian mở khóa (mới nhất trước)
    return new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime();
  });
};

/**
 * Nhóm achievements theo trạng thái
 * @param achievements - Danh sách achievements
 * @returns Object chứa achievements đã nhóm
 */
export const groupAchievementsByStatus = (
  achievements: UserAchievement[]
): {
  unlocked: UserAchievement[];
  locked: UserAchievement[];
} => {
  const unlocked: UserAchievement[] = [];
  const locked: UserAchievement[] = [];
  
  achievements.forEach(achievement => {
    if (isAchievementUnlocked(achievement)) {
      unlocked.push(achievement);
    } else {
      locked.push(achievement);
    }
  });
  
  return { unlocked, locked };
};

/**
 * Tính toán thống kê achievements
 * @param achievements - Danh sách achievements
 * @returns Object chứa thống kê
 */
export const calculateAchievementStats = (
  achievements: UserAchievement[]
): {
  total: number;
  unlocked: number;
  locked: number;
  completionPercentage: number;
} => {
  const total = achievements.length;
  const unlocked = achievements.filter(isAchievementUnlocked).length;
  const locked = total - unlocked;
  const completionPercentage = calculateCompletionPercentage(unlocked, total);
  
  return {
    total,
    unlocked,
    locked,
    completionPercentage
  };
};

/**
 * Validate achievement data
 * @param achievement - Achievement object
 * @returns true nếu valid, string error message nếu invalid
 */
export const validateAchievement = (achievement: any): string | true => {
  if (!achievement) {
    return 'Achievement is required';
  }
  
  if (!achievement.id) {
    return 'Achievement ID is required';
  }
  
  if (!achievement.achievement) {
    return 'Achievement details are required';
  }
  
  if (!achievement.achievement.title || !achievement.achievement.title.trim()) {
    return 'Achievement title is required';
  }
  
  if (!achievement.achievement.description || !achievement.achievement.description.trim()) {
    return 'Achievement description is required';
  }
  
  return true;
};

/**
 * Format thời gian mở khóa achievement
 * @param unlockedAt - Thời gian mở khóa (ISO string)
 * @returns Chuỗi thời gian đã format
 */
export const formatUnlockedDate = (unlockedAt: string | null): string => {
  if (!unlockedAt) return '';
  
  try {
    const date = new Date(unlockedAt);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Hôm nay';
    } else if (diffInDays === 1) {
      return 'Hôm qua';
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} tuần trước`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} tháng trước`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} năm trước`;
    }
  } catch (error) {
    return '';
  }
};