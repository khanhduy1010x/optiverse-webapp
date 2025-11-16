import api from './api.service';
import { DashboardStats } from '../types/membership-stats.type';

class MembershipStatsService {
  // Through Traefik, core-service is exposed under /core prefix
  private readonly BASE_PATH = 'core/user-memberships/statistics';

  /**
   * Get dashboard statistics
   * @param period - Period filter: 7d, 30d, 90d, 12m
   */
  async getDashboardStats(period: string = '30d'): Promise<DashboardStats> {
    try {
      const response = await api.get(`${this.BASE_PATH}/dashboard`, {
        params: { period }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get monthly revenue data
   * @param months - Number of months to retrieve (default: 12)
   */
  async getMonthlyRevenue(months: number = 12) {
    try {
      const response = await api.get(`${this.BASE_PATH}/monthly-revenue`, {
        params: { months }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      throw error;
    }
  }

  /**
   * Get subscription history with optional date filtering
   * @param fromDate - Start date filter
   * @param toDate - End date filter
   */
  async getSubscriptionHistory(fromDate?: Date, toDate?: Date) {
    try {
      const params: any = {};
      if (fromDate) params.from = fromDate.toISOString();
      if (toDate) params.to = toDate.toISOString();

      const response = await api.get(`${this.BASE_PATH}/subscriptions`, {
        params
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      throw error;
    }
  }

  /**
   * Get expiring subscriptions
   * @param days - Days to look ahead (default: 7)
   */
  async getExpiringSubscriptions(days: number = 7) {
    try {
      const response = await api.get(`${this.BASE_PATH}/expiring`, {
        params: { days }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching expiring subscriptions:', error);
      throw error;
    }
  }
}

export default new MembershipStatsService();
