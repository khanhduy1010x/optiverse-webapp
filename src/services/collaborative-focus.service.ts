/**
 * Collaborative Focus Service - Backend API
 * Simplified: Chỉ dùng để notify backend khi start/stop
 * Real-time sync dùng Firebase
 */

import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';
import { CreateFocusSessionDto } from '../types/collaborative-focus/collaborative-focus.types';

const BASE_URL = 'productivity/focus-sessions';

class CollaborativeFocusService {
  /**
   * Tạo phiên tập trung mới (gọi backend để lưu DB)
   */
  async createSession(data: CreateFocusSessionDto): Promise<{ sessionId: string }> {
    try {
      const response = await api.post<ApiResponse<{ sessionId: string }>>(
        `${BASE_URL}/create`,
        {
          workspaceId: data.workspaceId,
          title: data.title,
          description: data.description,
          duration: data.duration * 60, // Convert to seconds
        }
      );
      console.log('✅ Backend: Session created:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Failed to create session:', error);
      // Nếu backend lỗi, vẫn có thể dùng Firebase
      // Generate sessionId locally
      return { sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    }
  }

  /**
   * Notify backend khi start session
   */
  async startSession(sessionId: string): Promise<void> {
    try {
      await api.post(`${BASE_URL}/${sessionId}/start`);
      console.log('✅ Backend: Session started:', sessionId);
    } catch (error: any) {
      console.error('❌ Failed to notify start:', error);
      // Không throw, vẫn dùng Firebase
    }
  }

  /**
   * Notify backend khi stop/complete session
   */
  async stopSession(sessionId: string, completed: boolean = false): Promise<void> {
    try {
      await api.post(`${BASE_URL}/${sessionId}/stop`, { completed });
      console.log('✅ Backend: Session stopped:', sessionId);
    } catch (error: any) {
      console.error('❌ Failed to notify stop:', error);
      // Không throw, vẫn dùng Firebase
    }
  }

  /**
   * Delete session (gọi backend để xóa DB)
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await api.delete(`${BASE_URL}/${sessionId}`);
      console.log('✅ Backend: Session deleted:', sessionId);
    } catch (error: any) {
      console.error('❌ Failed to delete session:', error);
      // Không throw, vẫn xóa trên Firebase
    }
  }
}

export const collaborativeFocusService = new CollaborativeFocusService();
export default collaborativeFocusService;
