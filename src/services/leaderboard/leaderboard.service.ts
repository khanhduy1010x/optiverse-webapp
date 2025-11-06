import api from '../api.service';
import { ApiResponse } from '../../types/api/api.interface';

export enum TimePeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum RankingMetric {
  TOTAL_PRODUCTS = 'total_products',
  TOTAL_SPENDING = 'total_spending',
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  totalProducts: number;
  totalSpending: number;
  score: number;
  period: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  timePeriod: string;
  metric: string;
}

export interface UserRankResponse {
  userId: string;
  userName: string;
  userAvatar: string;
  rank: number;
  totalProducts: number;
  totalSpending: number;
  score: number;
  timePeriod: string;
  metric: string;
}

export interface LeaderboardParams {
  timePeriod?: TimePeriod;
  metric?: RankingMetric;
  page?: number;
  limit?: number;
}

const URLBASE = 'productivity/leaderboard';

class LeaderboardService {
  /**
   * Lấy danh sách bảng xếp hạng
   */
  async getLeaderboard(params: LeaderboardParams): Promise<LeaderboardResponse> {
    try {
      const response = await api.get<ApiResponse<LeaderboardResponse>>(URLBASE, {
        params,
      });

      // Handle both response formats
      // Format 1: API wrapper - response.data.data contains LeaderboardResponse
      // Format 2: Direct - response.data IS LeaderboardResponse
      const leaderboardData = response.data.data || response.data;

      return leaderboardData as LeaderboardResponse;
    } catch (error: any) {
      console.error('Error fetching leaderboard:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Lấy xếp hạng của một user cụ thể
   */
  async getUserRank(userId: string, params: LeaderboardParams): Promise<UserRankResponse> {
    try {
      const response = await api.get<ApiResponse<UserRankResponse>>(
        `${URLBASE}/user/${userId}`,
        { params }
      );

      // Handle both response formats
      // Format 1: API wrapper - response.data.data contains UserRankResponse
      // Format 2: Direct - response.data IS UserRankResponse
      const userData = response.data.data || response.data;

      return userData as UserRankResponse;
    } catch (error: any) {
      console.error(`Error fetching user rank for ${userId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }
}

export default new LeaderboardService();
