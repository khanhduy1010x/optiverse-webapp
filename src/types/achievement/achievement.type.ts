/**
 * Enum cho các loại điều kiện để mở khóa thành tựu
 */
export enum ConditionTypeEnum {
  TASKS_COMPLETED = 'TASKS_COMPLETED',
  TASKS_COMPLETED_WEEKLY = 'TASKS_COMPLETED_WEEKLY',
  TASKS_COMPLETED_MONTHLY = 'TASKS_COMPLETED_MONTHLY',
  FRIEND_COUNT = 'FRIENDS_COUNT',
}

/**
 * Interface cho dữ liệu thành tựu
 */
export interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon_url?: string;
  badge_image?: string;
  points?: number;
  created_at: string;
  updated_at: string;
  id?: string; // Một số response trả về thêm trường id ngoài _id
}

/**
 * Interface cho dữ liệu thành tựu đã đạt
 */
export interface UserAchievementWithDetails {
  _id: string;
  user_id: string;
  achievement_id: Achievement;
  unlocked_at: string;
  created_at: string;
  updated_at: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

/**
 * Interface cho dữ liệu loại thành tựu
 */
export interface AchievementType {
  _id: string;
  achievement_id: string;
  condition_type: ConditionTypeEnum;
  condition_value: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface cho dữ liệu thành tựu của người dùng
 */
export interface UserAchievement {
  _id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  created_at: string;
  updated_at: string;
} 