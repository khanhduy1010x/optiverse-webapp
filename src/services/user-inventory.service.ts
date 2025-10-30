import api from './api.service';
import { ApiResponse } from '../types/api/api.interface';

const URLBASE = 'productivity/user-inventory';

export interface UserInventoryItem {
  _id?: string;
  user_id?: string;
  op?: string | number;
  [key: string]: any;
}

class UserInventoryServiceClass {
  /**
   * Lấy thông tin inventory của user hiện tại
   */
  async getMyInventory(): Promise<UserInventoryItem[]> {
    try {
      const response = await api.get<ApiResponse<UserInventoryItem[]>>(URLBASE);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching user inventory:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }

  /**
   * Lấy điểm OP của user
   */
  async getUserPoints(): Promise<number> {
    try {
      const inventories = await this.getMyInventory();
      
      // Tìm record có op là số (là điểm)
      const pointsRecord = inventories.find((inv) => /^\d+$/.test(String(inv.op)));
      return pointsRecord ? parseInt(String(pointsRecord.op)) : 0;
    } catch (error) {
      console.error('Error getting user points:', error);
      return 0;
    }
  }

  /**
   * Cộng/trừ điểm cho user
   */
  async addReward(points: string | number): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${URLBASE}/add-reward`,
        { op: points.toString() }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error adding reward:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  }
}

export default new UserInventoryServiceClass();
