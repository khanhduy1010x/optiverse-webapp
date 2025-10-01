// Tin nhắn trong hội thoại
export interface MessageType {
  id: string;
  senderId: string;
  // Thông tin người gửi được lưu trực tiếp để tránh mất dữ liệu khi user rời nhóm
  senderInfo?: {
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  text: string;
  createdAt: number; // timestamp
  // Thứ tự ghim, từ 1-5, 1 là ưu tiên nhất
  pinnedBy?: {
    [userId: string]: number;
  };
  // Trường này dùng cho tìm kiếm tổng
  conversationId?: string;
  // Trạng thái đã đọc
  readBy?: {
    [userId: string]: boolean;
  };
  // Reactions cho tin nhắn
  reactions?: {
    [userId: string]: ReactionType; // Loại reaction
  };
  // Trạng thái tin nhắn
  status?: MessageStatus;
  // Người dùng đã ẩn tin nhắn này
  hiddenBy?: string[];
  // Người dùng đã xóa tin nhắn này
  deletedBy?: string[];
  // Hình ảnh trong tin nhắn
  images?: string[]; // Mảng URL của các hình ảnh
  // Tin nhắn thoại
  audio?: {
    url: string;
    duration: number; // Thời lượng tính bằng giây
  };
  // Tin nhắn trả lời
  replyTo?: {
    messageId: string;
    text: string;
    senderId: string;
  };
  // Có thể mở rộng thêm: attachments, etc.
}

// Các loại reaction được hỗ trợ
export enum ReactionType {
  LIKE = '👍',
  LOVE = '❤️',
  HAHA = '😂',
  WOW = '😮',
  SAD = '😢',
  ANGRY = '😡',
}

// Trạng thái của tin nhắn
export enum MessageStatus {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
}

// Loại tin nhắn
export enum MessageContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  REPLY = 'reply',
  MIXED = 'mixed', // Cả text và image/audio
}
