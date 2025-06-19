// Tin nhắn trong hội thoại
export interface MessageType {
  id: string;
  senderId: string;
  text: string;
  createdAt: number; // timestamp
  // Có thể mở rộng thêm: attachments, etc.
} 