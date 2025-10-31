import { ApiResponse } from '../types/api/api.interface';
import api from './api.service';

interface SpeechMessageResponse {
  _id?: string;
  room_id: string;
  user_id: string;
  speaker_name: string;
  text: string;
  createdAt?: string;
  avatar_url?: string;
  user_email?: string;
}

interface GetMessagesResponse {
  data: SpeechMessageResponse[];
  total: number;
  limit: number;
  skip: number;
}

class SpeechServiceClass {
  async getMessagesByRoomId(
    roomId: string,
    limit: number = 100,
    skip: number = 0
  ): Promise<SpeechMessageResponse[]> {
    try {
      const response = await api.get<GetMessagesResponse>(
        `/productivity/speech/messages?roomId=${roomId}&limit=${limit}&skip=${skip}`
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch speech messages:', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Could not fetch speech messages for room ${roomId}`);
    }
  }
}

const speechService = new SpeechServiceClass();
export default speechService;
