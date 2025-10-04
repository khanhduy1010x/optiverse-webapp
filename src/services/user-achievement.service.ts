import api from './api.service';
import {
  GetUnlockedAchievementsResponse,
  GetLockedAchievementsResponse,
  GetUserAchievementByIdResponse,
} from '../types/user-achievement/response/user-achievement.response';
import { UserAchievementListResponse, UserAchievement } from '../types/user-achievement/user-achievement.types';

class UserAchievementService {
  /**
   * Lấy tất cả thành tựu đã đạt được của người dùng hiện tại
   */
  public async getUnlockedAchievements(): Promise<UserAchievementListResponse> {
    try {
      const response = await api.get<GetUnlockedAchievementsResponse>('/productivity/user-achievement/my-achievements/unlocked');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching unlocked achievements:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả thành tựu chưa đạt được của người dùng hiện tại
   */
  public async getLockedAchievements(): Promise<UserAchievementListResponse> {
    try {
      const response = await api.get<GetLockedAchievementsResponse>('/productivity/user-achievement/my-achievements/locked');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching locked achievements:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết một thành tựu cụ thể của người dùng
   */
  public async getUserAchievementById(id: string): Promise<UserAchievement> {
    try {
      const response = await api.get<GetUserAchievementByIdResponse>(`/productivity/user-achievement/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching user achievement by id:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả thành tựu (cả đã đạt và chưa đạt) của người dùng hiện tại
   */
  public async getAllAchievements(): Promise<{
    unlocked: UserAchievementListResponse;
    locked: UserAchievementListResponse;
  }> {
    try {
      const [unlockedResponse, lockedResponse] = await Promise.all([
        this.getUnlockedAchievements(),
        this.getLockedAchievements(),
      ]);

      return {
        unlocked: unlockedResponse,
        locked: lockedResponse,
      };
    } catch (error: any) {
      console.error('Error fetching all achievements:', error);
      throw error;
    }
  }
}

export default new UserAchievementService();