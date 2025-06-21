// Hội thoại 1-1 hoặc nhóm (mở rộng sau này)
export interface ConversationType {
  id: string;
  members: { [userId: string]: true };
  lastMessageId?: string;
  hiddenBy?: { [userId: string]: true };
  createdAt?: number;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: number;
  };
  theme?: {
    backgroundUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    updatedAt?: number;
    updatedBy?: string;
  };
}
