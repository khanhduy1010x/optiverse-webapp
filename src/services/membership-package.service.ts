import api from './api.service';

export interface MembershipPackage {
  _id: string;
  name: string;
  level: number;
  description?: string;
  price: number;
  duration_days: number;
  opBonusCredits?: number;
  is_active: boolean;
  subscriber_count?: number;
  createdAt?: string;
  updatedAt?: string;
}
const CONTROLLER_PATH = 'core/membership-packages';

class MembershipPackageService {
  /**
   * Get all active membership packages
   */
  async getAllMembershipPackages(): Promise<MembershipPackage[]> {
    try {
      const response = await api.get(`${CONTROLLER_PATH}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Failed to fetch membership packages:', error);
      throw error;
    }
  }

  /**
   * Get membership package by level
   */
  async getMembershipPackageByLevel(level: number): Promise<MembershipPackage> {
    try {
      const response = await api.get(`${CONTROLLER_PATH}/${level}`);
      return response.data?.data;
    } catch (error) {
      console.error(
        `Failed to fetch membership package level ${level}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create membership package (Admin only)
   */
  async createMembershipPackage(
    dto: Partial<MembershipPackage>
  ): Promise<MembershipPackage> {
    try {
      const response = await api.post(`${CONTROLLER_PATH}`, dto);
      return response.data?.data;
    } catch (error) {
      console.error('Failed to create membership package:', error);
      throw error;
    }
  }

  /**
   * Update membership package (Admin only)
   */
  async updateMembershipPackage(
    level: number,
    dto: Partial<MembershipPackage>
  ): Promise<MembershipPackage> {
    try {
      const response = await api.patch(`${CONTROLLER_PATH}/${level}`, dto);
      return response.data?.data;
    } catch (error) {
      console.error(
        `Failed to update membership package level ${level}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Deactivate membership package (Admin only)
   */
  async deactivateMembershipPackage(level: number): Promise<MembershipPackage> {
    try {
      const response = await api.delete(`${CONTROLLER_PATH}/${level}`);
      return response.data?.data;
    } catch (error) {
      console.error(
        `Failed to deactivate membership package level ${level}:`,
        error
      );
      throw error;
    }
  }
}

export default new MembershipPackageService();
