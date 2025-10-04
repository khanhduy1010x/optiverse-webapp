import { AxiosResponse } from 'axios';
import AchievementService from '../services/achievement.service';

// Danh sách các API endpoints cần trigger achievement evaluation
const ACHIEVEMENT_TRIGGER_ENDPOINTS = [
  // Task operations
  '/productivity/task',
  '/productivity/task/',
  
  // Streak operations
  '/productivity/streak/login',
  '/productivity/streak/task',
  
  // Task-tag operations
  '/productivity/task-tag',
  '/productivity/task-tag/',
];

// Các HTTP methods cần trigger achievement evaluation
const TRIGGER_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Set để track các request đã được xử lý để tránh duplicate theo key
const processedRequests = new Set<string>();

// Cooldown map: mỗi endpoint+method có cooldown riêng để hạn chế spam
const cooldownMap = new Map<string, number>();
const COOLDOWN_MS = 3000; // 3s cooldown mỗi endpoint để tránh thông báo lặp

/**
 * Tạo unique key cho request để tránh duplicate processing
 */
const createRequestKey = (method: string, url: string, timestamp: number): string => {
  return `${method}:${url}:${Math.floor(timestamp / 1000)}`; // Group by second
};

/**
 * Kiểm tra xem API call có cần trigger achievement evaluation không
 */
export const shouldTriggerAchievementEvaluation = (
  method: string,
  url: string
): boolean => {
  // Chỉ trigger cho các methods quan trọng
  if (!TRIGGER_METHODS.includes(method.toUpperCase())) {
    return false;
  }

  // Không trigger cho chính API evaluate achievements để tránh vòng lặp
  if (url.includes('/productivity/achievement/evaluate')) {
    return false;
  }

  // Kiểm tra xem URL có match với các endpoints cần trigger không
  return ACHIEVEMENT_TRIGGER_ENDPOINTS.some(endpoint => 
    url.includes(endpoint)
  );
};

/**
 * Response interceptor để tự động gọi evaluateAchievements
 */
export const achievementResponseInterceptor = async (
  response: AxiosResponse
): Promise<AxiosResponse> => {
  try {
    const { config } = response;
    const method = config.method?.toUpperCase() || '';
    const url = config.url || '';

    // Kiểm tra xem có cần trigger achievement evaluation không
    if (shouldTriggerAchievementEvaluation(method, url)) {
      // Tạo unique key để tránh duplicate processing
      const requestKey = createRequestKey(method, url, Date.now());
      const cooldownKey = `${method}:${url}`;
      
      // Kiểm tra xem request này đã được xử lý chưa
      if (processedRequests.has(requestKey)) {
        console.log(`Achievement evaluation already processed for ${method} ${url}`);
        return response;
      }

      // Kiểm tra cooldown cho endpoint này
      const nowTs = Date.now();
      const lastTs = cooldownMap.get(cooldownKey) || 0;
      if (nowTs - lastTs < COOLDOWN_MS) {
        console.log(`Skip achievement evaluation due to cooldown for ${cooldownKey}`);
        return response;
      }
      cooldownMap.set(cooldownKey, nowTs);
      
      // Đánh dấu request đã được xử lý
      processedRequests.add(requestKey);
      
      // Cleanup old entries (giữ lại entries trong 5 giây)
      setTimeout(() => {
        processedRequests.delete(requestKey);
      }, 5000);
      
      console.log(`Triggering achievement evaluation for ${method} ${url}`);
      
      // Gọi evaluateAchievements trong background (không chờ kết quả)
      AchievementService.evaluateAchievements().catch(error => {
        console.warn('Achievement evaluation failed:', error);
        // Không throw error để không ảnh hưởng đến API call chính
      });
    }
  } catch (error) {
    console.warn('Achievement interceptor error:', error);
    // Không throw error để không ảnh hưởng đến API call chính
  }

  return response;
};

/**
 * Error interceptor để đảm bảo không trigger achievement khi API call thất bại
 */
export const achievementErrorInterceptor = (error: any) => {
  // Không trigger achievement evaluation khi có lỗi
  return Promise.reject(error);
};