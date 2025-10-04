export interface NotificationSettings {
  _id: string;
  user_id: string;
  task_notifications: boolean;
  flashcard_notifications: boolean;
  chat_notifications: boolean;
  friend_notifications: boolean;
  note_notifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationSettingsDto {
  task_notifications?: boolean;
  flashcard_notifications?: boolean;
  chat_notifications?: boolean;
  friend_notifications?: boolean;
  note_notifications?: boolean;
}
