import { Achievement } from '../achievement.types';

export interface AchievementResponse {
  success: boolean;
  message: string;
  data: Achievement;
}

export interface AchievementListResponse {
  success: boolean;
  message: string;
  data: Achievement[];
}

export interface DeleteAchievementResponse {
  success: boolean;
  message: string;
}