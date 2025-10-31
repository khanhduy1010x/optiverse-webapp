import { ApiResponse } from '../types/api/api.interface';
import api from './api.service';

export interface RecordingStatus {
  id: string;
  roomName: string;
  status: string;
  error?: string;
  startedAt?: string;
  endedAt?: string;
  updatedAt?: string;
}

export interface RecordingRecord {
  _id: string;
  title?: string;
  egress_id?: string;
  gcp_url?: string;
  started_at?: string | null;
  ended_at?: string | null;
  durationMs?: number | null;
  duration?: string | null; // HH:MM:SS
  isSummarized?: boolean;
  summarizedContent?: string | null;
}

class RecordingService {
  private basePath = '/productivity/focus-room';

  public async startRecording(
    roomId: string
  ): Promise<{ egressId: string; message: string }> {
    try {
      const response = await api.post<
        ApiResponse<{ egressId: string; message: string }>
      >(`${this.basePath}/${roomId}/recording/start`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  public async stopRecording(roomId: string): Promise<{ message: string }> {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>(
        `${this.basePath}/${roomId}/recording/stop`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  public async getRecordingStatus(roomId: string): Promise<RecordingStatus[]> {
    try {
      const response = await api.get<ApiResponse<RecordingStatus[]>>(
        `${this.basePath}/${roomId}/recording/status`
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching recording status:', error);
      return [];
    }
  }

  public async getRecordsByRoom(roomId: string): Promise<RecordingRecord[]> {
    try {
      const response = await api.get<ApiResponse<RecordingRecord[]>>(
        `${this.basePath}/${roomId}/records`
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching records by room:', error);
      return [];
    }
  }

  /**
   * Get a signed URL for a record. mode = 'stream' | 'download'
   */
  public async getSignedUrl(
    recordId: string,
    mode: 'stream' | 'download' = 'stream'
  ): Promise<string> {
    try {
      const response = await api.get<ApiResponse<{ url: string }>>(
        `${this.basePath}/public/records/${recordId}/signed-url?mode=${mode}`
      );
      return response.data.data?.url ?? '';
    } catch (error: any) {
      console.error('Error getting signed url:', error);
      return '';
    }
  }

  /**
   * Summarize a recording by ID
   * @param recordId - The recording ID
   * @param type - Type of summary (1-4: standard, executive, discussion, action)
   * @param meetingPurpose - Optional context about the meeting purpose
   * @returns HTML formatted summary
   */
  public async summarizeRecording(
    recordId: string,
    type?: number,
    meetingPurpose?: string
  ): Promise<string> {
    try {
      const payload: Record<string, any> = {};
      if (type && [1, 2, 3, 4].includes(type)) payload.type = type;
      if (meetingPurpose?.trim())
        payload.meetingPurpose = meetingPurpose.trim();

      const response = await api.post<ApiResponse<{ summary: string }>>(
        `${this.basePath}/${recordId}/summarize`,
        payload
      );

      const summaryHtml = response.data.data?.summary ?? '';

      // Basic validation that we received HTML content
      if (summaryHtml && !summaryHtml.includes('<')) {
        console.warn('Received non-HTML summary, wrapping in basic HTML');
        return `<div><p>${summaryHtml}</p></div>`;
      }

      return summaryHtml;
    } catch (error: any) {
      console.error('Error summarizing recording:', error);
      throw error;
    }
  }
  /**
   * Update recording title
   * @param recordId - The recording ID
   * @param title - New title for the recording
   * @returns Updated title and message
   */
  public async updateRecordingTitle(
    recordId: string,
    title: string
  ): Promise<{ message: string; title: string }> {
    try {
      const response = await api.patch<
        ApiResponse<{ message: string; title: string }>
      >(`${this.basePath}/${recordId}/title`, { title: title.trim() });
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating recording title:', error);
      throw error;
    }
  }
}

export default new RecordingService();
