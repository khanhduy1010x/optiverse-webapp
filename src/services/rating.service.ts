import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';

export interface Rating {
  _id: string;
  marketplace_id: string;
  user_id: string;
  user_info?: {
    user_id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  comment?: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateRatingPayload {
  marketplace_id: string;
  rating: number;
  comment?: string;
}

export interface UpdateRatingPayload {
  rating?: number;
  comment?: string;
}

const URLBASE = 'productivity/marketplace/ratings';

class RatingServiceClass {
  /**
   * Lấy tất cả đánh giá của một marketplace item
   */
  async getByMarketplaceId(
    marketplaceId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ ratings: Rating[]; total: number }> {
    try {
      const response = await api.get<
        ApiResponse<{
          ratings: Rating[];
          total: number;
        }>
      >(`${URLBASE}/item/${marketplaceId}`, { params: { page, limit } });

      return {
        ratings: response.data.data.ratings || [],
        total: response.data.data.total || 0,
      };
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê đánh giá của một marketplace item
   */
  async getRatingStats(marketplaceId: string): Promise<RatingStats> {
    try {
      const response = await api.get<
        ApiResponse<RatingStats>
      >(`${URLBASE}/stats/${marketplaceId}`);

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching rating stats:', error);
      // Return default stats if error
      return {
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  }

  /**
   * Lấy đánh giá trung bình
   */
  async getAverageRating(marketplaceId: string): Promise<number> {
    try {
      const response = await api.get<
        ApiResponse<{
          averageRating: number;
        }>
      >(`${URLBASE}/average/${marketplaceId}`);

      return response.data.data.averageRating;
    } catch (error: any) {
      console.error('Error fetching average rating:', error);
      return 0;
    }
  }

  /**
   * Lấy đánh giá của người dùng hiện tại
   */
  async getMyRatings(page: number = 1, limit: number = 10): Promise<{ ratings: Rating[]; total: number }> {
    try {
      const response = await api.get<
        ApiResponse<{
          ratings: Rating[];
          total: number;
        }>
      >(`${URLBASE}/user/my-ratings`, { params: { page, limit } });

      return {
        ratings: response.data.data.ratings || [],
        total: response.data.data.total || 0,
      };
    } catch (error: any) {
      console.error('Error fetching my ratings:', error);
      throw error;
    }
  }

  /**
   * Lấy đánh giá theo ID
   */
  async getById(id: string): Promise<Rating> {
    try {
      const response = await api.get<
        ApiResponse<{
          data: Rating;
        }>
      >(`${URLBASE}/${id}`);

      return response.data.data.data;
    } catch (error: any) {
      console.error('Error fetching rating:', error);
      throw error;
    }
  }

  /**
   * Tạo đánh giá mới
   */
  async create(payload: CreateRatingPayload): Promise<Rating> {
    try {
      const response = await api.post<
        ApiResponse<{
          data: Rating;
        }>
      >(`${URLBASE}`, payload);

      return response.data.data.data;
    } catch (error: any) {
      console.error('Error creating rating:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đánh giá
   */
  async update(ratingId: string, payload: UpdateRatingPayload): Promise<Rating> {
    try {
      const response = await api.put<
        ApiResponse<{
          data: Rating;
        }>
      >(`${URLBASE}/${ratingId}`, payload);

      return response.data.data.data;
    } catch (error: any) {
      console.error('Error updating rating:', error);
      throw error;
    }
  }

  /**
   * Xóa đánh giá
   */
  async delete(ratingId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.delete<
        ApiResponse<{
          success: boolean;
        }>
      >(`${URLBASE}/${ratingId}`);

      return response.data.data;
    } catch (error: any) {
      console.error('Error deleting rating:', error);
      throw error;
    }
  }
}

const ratingService = new RatingServiceClass();
export default ratingService;
