import api from './api.service';

export interface PaymentResponse {
  payUrl?: string;
  checkoutUrl?: string;
  orderId: string;
  requestId: string;
  resultCode?: number;
  code?: string;
  message: string;
}

export interface PaymentRequest {
  packageId: string;
}

const CONTROLLER_PATH = 'productivity/payment-membership';

class PaymentService {
  /**
   * Create MoMo payment
   * @param packageId - The membership package ID
   */
  async createMomoPayment(packageId: string): Promise<PaymentResponse> {
    try {
      const response = await api.post(`${CONTROLLER_PATH}/pay-momo`, {
        packageId,
      });
      return response.data?.data;
    } catch (error) {
      console.error('Failed to create MoMo payment:', error);
      throw error;
    }
  }

  /**
   * Create PayOS payment (QR Code)
   * @param packageId - The membership package ID
   */
  async createPayOSPayment(packageId: string): Promise<PaymentResponse> {
    try {
      const response = await api.post(`${CONTROLLER_PATH}/pay-payos`, {
        packageId,
      });
      return response.data?.data;
    } catch (error) {
      console.error('Failed to create PayOS payment:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<any[]> {
    try {
      const response = await api.get(`${CONTROLLER_PATH}/payment-history`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      throw error;
    }
  }

  /**
   * Get payment detail by order ID
   */
  async getPaymentDetail(orderId: string): Promise<any> {
    try {
      const response = await api.get(
        `${CONTROLLER_PATH}/payment-detail/${orderId}`
      );
      return response.data?.data;
    } catch (error) {
      console.error('Failed to fetch payment detail:', error);
      throw error;
    }
  }
}

export default new PaymentService();
