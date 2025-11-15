// Hội thoại 1-1 hoặc nhóm (mở rộng sau này)
export interface ConversationType {
  id: string;
  type?: 'direct' | 'group'; // Loại hội thoại: 1-1 hoặc nhóm
  members: { [userId: string]: true };
  lastMessageId?: string;
  hiddenBy?: { [userId: string]: true };
  // Xóa mềm: lưu thông tin user nào đã xóa conversation và thời gian xóa
  deletedBy?: { [userId: string]: number }; // timestamp khi user xóa conversation (ẩn khỏi list)
  messagesDeletedAt?: { [userId: string]: number }; // timestamp để filter messages (giữ lại khi restore conversation)
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
  // Thứ tự ghim, từ 1-5, 1 là ưu tiên nhất
  pinnedBy?: {
    [userId: string]: number;
  };
}
