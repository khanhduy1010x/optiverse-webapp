import  api  from './api.service';
import { 
  Achievement, 
  Rule, 
  RuleCategory, 
  LogicOperator, 
  ValueType, 
  Operator 
} from '../types/achievement/achievement.types';
import { AchievementFormData, UpdateAchievementRequest, CreateAchievementRequest } from '../types/achievement/request/achievement.request';
import { AchievementListResponse, AchievementResponse, DeleteAchievementResponse } from '../types/achievement/response/achievement.response';
import { ApiResponse } from '../types/api/api.interface';

class AchievementService {
  // TTL chống trùng thông báo theo achievement
  private readonly TOAST_COOLDOWN_MS = 3000;
  private readonly TOAST_SESSION_PREFIX = 'achievementToastShown:';

  private hasRecentToast(achievementId: string): boolean {
    try {
      const key = `${this.TOAST_SESSION_PREFIX}${achievementId}`;
      const lastShown = sessionStorage.getItem(key);
      if (!lastShown) return false;
      const last = parseInt(lastShown, 10);
      return !isNaN(last) && Date.now() - last < this.TOAST_COOLDOWN_MS;
    } catch (_) {
      return false;
    }
  }

  private markToastShown(achievementId: string): void {
    try {
      const key = `${this.TOAST_SESSION_PREFIX}${achievementId}`;
      sessionStorage.setItem(key, Date.now().toString());
    } catch (_) {
      // ignore
    }
  }
  // Lấy tất cả achievements
  async getAllAchievements(): Promise<AchievementListResponse> {
    try {
      const response = await api.get<ApiResponse<AchievementListResponse>>('/productivity/achievement');
      console.log('Achievement list response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  // Lấy achievement theo ID
  async getAchievementById(id: string): Promise<AchievementResponse> {
    try {
      const response = await api.get<ApiResponse<AchievementResponse>>(`/productivity/achievement/${id}`);
      console.log('Achievement detail response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching achievement ${id}:`, error);
      throw error;
    }
  }

  // Tạo achievement mới
  async createAchievement(data: AchievementFormData): Promise<AchievementResponse> {
    try {
      if (data.icon_file) {
        // Sử dụng FormData khi có file upload
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        // Đính kèm file với key 'icon_file' theo chuẩn yêu cầu
        formData.append('icon_file', data.icon_file);
        // Gửi rules dưới dạng JSON string để server parse lại
        formData.append('rules', JSON.stringify(data.rules));
        formData.append('logic_operator', String(data.logic_operator));
        formData.append('reward', data.reward || '');

        const response = await api.post<ApiResponse<AchievementResponse>>('/productivity/achievement', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Create achievement with file response:', response.data);
        return response.data.data || response.data;
      } else {
        // Sử dụng JSON khi không có file upload
        const requestData: CreateAchievementRequest = {
          title: data.title,
          description: data.description,
          icon_url: data.icon_url || '',
          rules: Array.isArray(data.rules) ? data.rules : [],
          logic_operator: data.logic_operator,
          reward: data.reward,
        };
        
        const response = await api.post<ApiResponse<AchievementResponse>>('/productivity/achievement', requestData);
        console.log('Create achievement response:', response.data);
        return response.data.data || response.data;
      }
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  }

  // Cập nhật achievement
  async updateAchievement(id: string, data: AchievementFormData): Promise<AchievementResponse> {
    try {
      if (data.icon_file) {
        // Sử dụng FormData khi có file upload
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        // Đính kèm file với key 'icon_file' theo chuẩn yêu cầu
        formData.append('icon_file', data.icon_file);
        formData.append('rules', JSON.stringify(data.rules));
        formData.append('logic_operator', String(data.logic_operator));
        formData.append('reward', data.reward || '');

        const response = await api.put<ApiResponse<AchievementResponse>>(`/productivity/achievement/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Update achievement with file response:', response.data);
        return response.data.data || response.data;
      } else {
        // Sử dụng JSON khi không có file upload
        const requestData: UpdateAchievementRequest = {
          title: data.title,
          description: data.description,
          icon_url: data.icon_url,
          rules: Array.isArray(data.rules) ? data.rules : [],
          logic_operator: data.logic_operator,
          reward: data.reward,
        };
        
        const response = await api.put<ApiResponse<AchievementResponse>>(`/productivity/achievement/${id}`, requestData);
        console.log('Update achievement response:', response.data);
        return response.data.data || response.data;
      }
    } catch (error) {
      console.error(`Error updating achievement ${id}:`, error);
      throw error;
    }
  }

  // Xóa achievement
  async deleteAchievement(id: string): Promise<DeleteAchievementResponse> {
    try {
      const response = await api.delete<ApiResponse<DeleteAchievementResponse>>(`/productivity/achievement/${id}`);
      console.log('Delete achievement response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error deleting achievement ${id}:`, error);
      throw error;
    }
  }

  // Đánh giá achievements
  async evaluateAchievements(): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>('/productivity/achievement/evaluate');
      console.log('Evaluate achievements response:', response.data);
      
      const result = response.data.data || response.data;
      
      // Kiểm tra nếu có achievement mới được mở khóa (sử dụng newlyUnlocked thay vì unlocked)
      const newlyUnlockedAchievements = result?.newlyUnlocked || [];
      if (newlyUnlockedAchievements.length > 0) {
        // Import toast dynamically để tránh circular dependency
        const { toast } = await import('react-toastify');
        
        // Hiển thị thông báo cho từng achievement mới (chỉ những achievement thực sự mới unlock)
        newlyUnlockedAchievements.forEach((achievementId: string) => {
          // Tìm thông tin chi tiết của achievement từ results
          const achievementResult = result.results?.find((r: any) => r.achievementId === achievementId);
          const toastId = `achievement-${achievementId}`;

          // Bỏ qua nếu toast đang hiển thị hoặc vừa hiển thị gần đây
          if ((toast.isActive && toast.isActive(toastId)) || this.hasRecentToast(achievementId)) {
            return;
          }

          toast.success(
            `🎉 Congratulations! You've unlocked a new achievement!`,
            {
              toastId,
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              className: 'achievement-toast',
              style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              }
            }
          );

          // Đánh dấu đã hiển thị để chống trùng trong TTL
          this.markToastShown(achievementId);
        });
        
        console.log(`Displayed ${newlyUnlockedAchievements.length} achievement notification(s) for newly unlocked achievements`);
      }
      
      return result;
    } catch (error) {
      console.error('Error evaluating achievements:', error);
      throw error;
    }
  }
}

export default new AchievementService();