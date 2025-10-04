export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_url: string;
  reward?: string;
}

export interface UserAchievement {
  id: string | null;
  user_id: string;
  achievement: Achievement;
  unlocked_at: Date | null;
}

export interface UserAchievementListResponse {
  total: number;
  achievements: UserAchievement[];
}

export interface UserAchievementState {
  unlockedAchievements: UserAchievement[];
  lockedAchievements: UserAchievement[];
  loading: boolean;
  error: string | null;
}