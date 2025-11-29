import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';
import {
  MarketplaceItem,
  CreateMarketplaceItemPayload,
  UpdateMarketplaceItemPayload,
  PurchasePayload,
  PurchaseResponse,
  PurchaseHistoryItem,
  SalesHistoryItem,
} from '../types/marketplace/marketplace.types';

// Export types for convenience
export type {
  MarketplaceItem,
  CreateMarketplaceItemPayload,
  UpdateMarketplaceItemPayload,
  PurchasePayload,
  PurchaseResponse,
  PurchaseHistoryItem,
  SalesHistoryItem,
};

const URLBASE = 'productivity/marketplace';

class MarketplaceServiceClass {
  /**
   * Lấy danh sách marketplace items với filter và phân trang
   */
  async getPaginated(queryString: string = 'page=1&limit=12') {
    try {
      const response = await api.get<
        ApiResponse<{
          items: MarketplaceItem[];
          total: number;
          totalPages: number;
        }>
      >(`${URLBASE}/paginated?${queryString}`);

      return {
        items: response.data.data.items || [],
        total: response.data.data.total || 0,
        totalPages: response.data.data.totalPages || 0,
      };
    } catch (error: any) {
      console.error('Error fetching paginated marketplace items:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Lấy chi tiết một marketplace item
   */
  async getById(id: string): Promise<MarketplaceItem> {
    try {
      const response = await api.get<ApiResponse<MarketplaceItem>>(
        `${URLBASE}/${id}`
      );

      return response.data.data;
    } catch (error: any) {
      console.error(`Error fetching marketplace item ${id}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Tạo marketplace item mới với upload ảnh
   */
  async create(payload: CreateMarketplaceItemPayload | FormData): Promise<MarketplaceItem> {
    try {
      let data: any;

      // Nếu là FormData (từ frontend pages), dùng trực tiếp
      if (payload instanceof FormData) {
        data = payload;
      } else {
        // Nếu là object, convert thành FormData
        data = new FormData();
        data.append('title', payload.title);
        if (payload.description) {
          data.append('description', payload.description);
        }
        data.append('price', payload.price.toString());
        data.append('type', payload.type);
        if (payload.type_id) {
          data.append('type_id', payload.type_id);
        }

        if (payload.images) {
          payload.images.forEach((file) => {
            data.append('images', file);
          });
        }
      }

      const response = await api.post<ApiResponse<{ data: MarketplaceItem }>>(
        `${URLBASE}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data.data;
    } catch (error: any) {
      console.error('Error creating marketplace item:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Cập nhật marketplace item
   */
  async update(
    id: string,
    payload: UpdateMarketplaceItemPayload | FormData
  ): Promise<MarketplaceItem> {
    try {
      let data: any;

      // Nếu là FormData, dùng trực tiếp
      if (payload instanceof FormData) {
        data = payload;
      } else {
        // Nếu là object, convert thành FormData
        data = new FormData();
        if (payload.title) data.append('title', payload.title);
        if (payload.description) data.append('description', payload.description);
        if (payload.price !== undefined) data.append('price', payload.price.toString());
        if (payload.type_id) data.append('type_id', payload.type_id);

        if (payload.images) {
          payload.images.forEach((file) => {
            data.append('images', file);
          });
        }
      }

      const response = await api.put<ApiResponse<{ data: MarketplaceItem }>>(
        `${URLBASE}/${id}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data.data;
    } catch (error: any) {
      console.error(`Error updating marketplace item ${id}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Xóa marketplace item
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `${URLBASE}/${id}`
      );

      return response.data.data;
    } catch (error: any) {
      console.error(`Error deleting marketplace item ${id}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Lấy danh sách marketplace items của user hiện tại
   */
  async getMyItems(page: number = 1, limit: number = 10) {
    try {
      const params = { page, limit };

      const response = await api.get<
        ApiResponse<{
          items: MarketplaceItem[];
          total: number;
        }>
      >(`${URLBASE}/user/my-items`, { params });

      return {
        items: response.data.data.items || [],
        total: response.data.data.total || 0,
      };
    } catch (error: any) {
      console.error('Error fetching my marketplace items:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Lấy danh sách marketplace items của một creator với filter (12 items max)
   */
  async getByCreatorId(
    creatorId: string,
    page: number = 1,
    limit: number = 12,
    search?: string,
    price?: string,
    sort?: string
  ) {
    try {
      const params: any = { page, limit };

      if (search) {
        params.search = search;
      }

      if (price) {
        params.price = price;
      }

      if (sort) {
        params.sort = sort;
      }

      const response = await api.get<
        ApiResponse<{
          items: MarketplaceItem[];
          total: number;
          totalPages: number;
        }>
      >(`${URLBASE}/user/${creatorId}`, { params });

      return {
        items: response.data.data.items || [],
        total: response.data.data.total || 0,
        totalPages: response.data.data.totalPages || 0,
      };
    } catch (error: any) {
      console.error(`Error fetching marketplace items for creator ${creatorId}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Lấy preview flashcards (20%) của marketplace item
   */
  async getPreviewFlashcards(id: string) {
    try {
      const response = await api.get<
        ApiResponse<{
          flashcards: any[];
          totalFlashcards: number;
          previewCount: number;
        }>
      >(`${URLBASE}/preview/${id}`);

      return {
        flashcards: response.data.data.flashcards || [],
        totalFlashcards: response.data.data.totalFlashcards || 0,
        previewCount: response.data.data.previewCount || 0,
      };
    } catch (error: any) {
      console.error(`Error fetching preview flashcards for item ${id}:`, {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Mua marketplace item
   */
  async purchase(payload: PurchasePayload): Promise<PurchaseResponse> {
    try {
      const response = await api.post<ApiResponse<{ data: PurchaseResponse }>>(
        `${URLBASE}/purchase`,
        payload
      );

      return response.data.data.data;
    } catch (error: any) {
      console.error('Error purchasing marketplace item:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Helper method to fetch paginated history data
   */
  private async fetchHistory<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    errorMessage: string
  ): Promise<{ items: T[]; total: number }> {
    try {
      const params = { page, limit };

      const response = await api.get<ApiResponse<{ items: T[]; total: number }>>(
        endpoint,
        { params }
      );

      // Handle both response formats
      const data = response.data.data;
      return {
        items: (data?.items) || [],
        total: (data?.total) || 0,
      };
    } catch (error: any) {
      console.error(errorMessage, {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Lấy danh sách purchase history (các item đã mua) của user
   */
  async getPurchaseHistory(page: number = 1, limit: number = 10) {
    return this.fetchHistory<PurchaseHistoryItem>(
      `${URLBASE.replace('marketplace', 'purchase-history')}/my-purchases`,
      page,
      limit,
      'Error fetching purchase history:'
    );
  }

  /**
   * Lấy danh sách sales history (các item đã bán) của user
   */
  async getSalesHistory(page: number = 1, limit: number = 10) {
    return this.fetchHistory<SalesHistoryItem>(
      `${URLBASE.replace('marketplace', 'purchase-history')}/my-sales`,
      page,
      limit,
      'Error fetching sales history:'
    );
  }

  /**
   * Lấy sales analytics của seller
   */
  async getSalesAnalytics() {
    try {
      const response = await api.get<ApiResponse<{
        totalRevenue: number;
        totalSales: number;
        salesByMonth: Array<{
          _id: { year: number; month: number };
          revenue: number;
          count: number;
        }>;
        topSellingItems: Array<{
          _id: string;
          totalRevenue: number;
          totalSales: number;
          title: string;
          price: number;
        }>;
      }>>(`${URLBASE.replace('marketplace', 'purchase-history')}/analytics`);

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching sales analytics:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }
}

export default new MarketplaceServiceClass();
