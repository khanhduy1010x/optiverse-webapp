import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';

interface FollowResponse {
  message: string;
}

interface FollowStatusResponse {
  isFollowing: boolean;
}

interface ToggleFollowResponse {
  isFollowing: boolean;
  message: string;
}

interface CountResponse {
  count: number;
}

const URLBASE = 'productivity/marketplace/followers';

class MarketplaceFollowerService {
  /**
   * Toggle follow
   */
  async toggleFollow(creatorId: string): Promise<ToggleFollowResponse> {
    try {
      const response = await api.post<ApiResponse<ToggleFollowResponse>>(
        `${URLBASE}/toggle`,
        { creator_id: creatorId }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  }

  /**
   * Check if following
   */
  async isFollowing(creatorId: string): Promise<FollowStatusResponse> {
    try {
      const response = await api.get<ApiResponse<FollowStatusResponse>>(
        `${URLBASE}/check/${creatorId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error checking follow status:', error);
      throw error;
    }
  }

  /**
   * Get following list
   */
  async getFollowingList(page: number = 1, limit: number = 10, search: string = '') {
    try {
      let url = `${URLBASE}/following?page=${page}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await api.get<ApiResponse<any>>(url);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching following list:', error);
      throw error;
    }
  }
}

export default new MarketplaceFollowerService();
