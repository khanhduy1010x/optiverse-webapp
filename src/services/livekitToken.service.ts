import { ApiResponse } from '../types/api/api.interface';
import api from './api.service';

interface JoinTokenResponse {
  token?: string;
  requiresPassword?: boolean;
  message?: string;
}

class LivekitTokenService {
  private basePath = '/productivity/focus-room';

  public async getJoinToken(
    roomId: string,
    password?: string,
    joinType?: 'password' | 'request'
  ): Promise<JoinTokenResponse> {
    try {
      const params: any = { roomId };
      if (password) params.password = password;
      if (joinType) params.joinType = joinType;

      const response = await api.get<ApiResponse<JoinTokenResponse>>(
        `${this.basePath}/token`,
        { params }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting join token:', error);
      throw error;
    }
  }
}

export default new LivekitTokenService();
