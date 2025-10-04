import { UserAchievement, UserAchievementListResponse } from '../user-achievement.types';

export interface GetUnlockedAchievementsResponse {
  data: UserAchievementListResponse;
  message: string;
  success: boolean;
}

export interface GetLockedAchievementsResponse {
  data: UserAchievementListResponse;
  message: string;
  success: boolean;
}

export interface GetUserAchievementByIdResponse {
  data: UserAchievement;
  message: string;
  success: boolean;
}