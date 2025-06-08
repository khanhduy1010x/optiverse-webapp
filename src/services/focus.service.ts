import { CreateFocusTimerRequest } from './../types/focus-timer/request/focus-timer.request';
import { ApiResponse } from '../types/api/api.interface';
import api from './api.service';
import { FocusTimerResponse } from '../types/focus-timer/response/focus-timer.response';

class FocusService {
  private readonly focusPath = '/productivity/focus-session';

  public async getFocusTimerList(): Promise<FocusTimerResponse[]> {
    try {
      const response = await api.get<ApiResponse<FocusTimerResponse[]>>(
        `${this.focusPath}`
      );
      const data = response.data.data;
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return [];
  }
  
  public async createFocusTimer(item: CreateFocusTimerRequest): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(`${this.focusPath}`, {
        start_time: item.start_time.toISOString(),
        end_time: item.end_time.toISOString(),
      });
      const data = response.data.data;
      console.log(data);
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
    }
    return null;
  }
  public async deleteFocusTimer(id: string): Promise<any> {
    try {
      const response = await api.delete<ApiResponse<any>>(
        `${this.focusPath}/${id}`
      );
      const data = response.data.data;
      console.log(data);
      return data;
    } catch (error) {
      console.error('Lỗi khi fetch API:', error);
      throw new Error('Failed to delete session.');
    }
  }
}

export default new FocusService();
