import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';
import { MarketplaceItem } from '../types/marketplace/marketplace.types';
import { 
  ToggleFavoritePayload, 
  ToggleFavoriteResponse,
  FavoriteCountResponse
} from '../types/marketplace/favorite.types';

const URLBASE = 'productivity/marketplace/favorites';

class FavoriteServiceClass {
  /**
   * Toggle favorite (thêm/xóa)
   */
  async toggleFavorite(payload: ToggleFavoritePayload): Promise<ToggleFavoriteResponse> {
    try {
      const response = await api.post<ApiResponse<ToggleFavoriteResponse>>(
        `${URLBASE}/toggle`,
        payload
      );
      
      // ApiResponseWrapper structure: { data: { isFavorited, message } }
      return response.data.data;
    } catch (error: any) {
      console.error('Error toggling favorite:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Thêm item vào favorites
   */
  async addFavorite(marketplaceItemId: string): Promise<{ message: string }> {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>(
        `${URLBASE}/add`,
        { marketplace_item_id: marketplaceItemId }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error adding favorite:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Xóa item khỏi favorites
   */
  async removeFavorite(marketplaceItemId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${URLBASE}/remove/${marketplaceItemId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error removing favorite:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Kiểm tra item đã được favorite chưa
   */
  async checkFavorite(marketplaceItemId: string): Promise<{ isFavorited: boolean }> {
    try {
      const response = await api.get<ApiResponse<{ isFavorited: boolean }>>(
        `${URLBASE}/check/${marketplaceItemId}`
      );
      // ApiResponseWrapper structure: { data: { isFavorited } }
      return response.data.data;
    } catch (error: any) {
      console.error('Error checking favorite:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Lấy danh sách favorites của user
   */
  async getMyFavorites(page: number = 1, limit: number = 10) {
    try {
      const params = { page, limit };
      const response = await api.get<
        ApiResponse<{
          items: MarketplaceItem[];
          total: number;
        }>
      >(`${URLBASE}/my-favorites`, { params });

      return {
        items: response.data.data.items || [],
        total: response.data.data.total || 0,
      };
    } catch (error: any) {
      console.error('Error fetching my favorites:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Lấy số lượng favorites của một item
   */
  async getFavoriteCount(marketplaceItemId: string): Promise<FavoriteCountResponse> {
    try {
      const response = await api.get<ApiResponse<FavoriteCountResponse>>(
        `${URLBASE}/count/${marketplaceItemId}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching favorite count:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }
}

export default new FavoriteServiceClass();
