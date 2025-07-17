export interface StreakResponse {
  _id?: string;
  user_id?: string;
  loginStreak?: number;
  lastLoginDate?: string | Date;
  taskStreak?: number;
  lastTaskDate?: string | Date;
  flashcardStreak?: number;
  lastFlashcardDate?: string | Date;
} 