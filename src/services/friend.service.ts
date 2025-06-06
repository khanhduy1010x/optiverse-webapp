import api from './api.service';
import { AxiosResponse } from 'axios';

// Interface cho Friend từ backend
interface FriendUserInfo {
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

interface Friend {
  _id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt?: string;
  updatedAt?: string;
  friendInfo?: FriendUserInfo;
}

// Interface cho ApiResponse từ backend
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message?: string;
}

// Interface cho CreateFriendRequest DTO
interface CreateFriendRequest {
  user_id: string;
  friend_id: string;
}

// Interface cho UpdateFriendRequest DTO
interface UpdateFriendRequest {
  status?: string;
}

// Interface cho UserDto (tìm kiếm user)
interface UserDto {
  userId: string;
  email: string;
  _id?: string;
  full_name?: string;
  // Thêm các trường khác nếu cần
}

// Cache system
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class FriendServiceClass {
  private cache: Record<string, CacheItem<any>> = {};
  private cacheDuration = 60000; // 1 phút (60000ms)
  private userCache: Record<string, UserDto> = {};
  private retryAttempt = false;
  
  // Helper để kiểm tra cache
  private getFromCache<T>(key: string): T | null {
    const item = this.cache[key];
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      // Cache đã hết hạn
      delete this.cache[key];
      return null;
    }
    
    return item.data as T;
  }
  
  // Helper để lưu vào cache
  private saveToCache<T>(key: string, data: T, expiresIn: number = this.cacheDuration): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      expiresIn
    };
  }
  
  // Xóa cache theo key pattern
  private invalidateCache(pattern: string): void {
    Object.keys(this.cache).forEach(key => {
      if (key.includes(pattern)) {
        delete this.cache[key];
      }
    });
  }

  // Lấy danh sách bạn bè theo userId
  async getFriendsByUserId(userId: string): Promise<Friend[]> {
    try {
    const response: AxiosResponse<ApiResponse<Friend[]>> = await api.get(`/productivity/friend/user/${userId}`);
    return response.data.data;
    } catch (error) {
      console.error(`Error fetching friends for user ${userId}:`, error);
      return [];
    }
  }

  // Tạo yêu cầu kết bạn
  async createFriendRequest(dto: CreateFriendRequest): Promise<Friend> {
    const response: AxiosResponse<ApiResponse<{ friend: Friend }>> = await api.post('/productivity/friend/create', dto);
    // Xóa cache liên quan
    this.invalidateCache('friends_');
    this.invalidateCache('sent');
    return response.data.data.friend;
  }

  // Cập nhật trạng thái bạn bè
  async updateFriend(friendId: string, dto: UpdateFriendRequest): Promise<Friend> {
    const response: AxiosResponse<ApiResponse<{ friend: Friend }>> = await api.put(`/productivity/friend/update/${friendId}`, dto);
    // Xóa cache liên quan
    this.invalidateCache('friends_');
    return response.data.data.friend;
  }

  // Xóa mối quan hệ bạn bè
  async deleteFriend(friendId: string): Promise<void> {
    await api.delete(`/productivity/friend/delete/${friendId}`);
    // Xóa cache liên quan
    this.invalidateCache('friends_');
  }

  // Tìm kiếm người dùng theo email
  async searchUserByEmail(email: string): Promise<UserDto | null> {
    const encodedEmail = encodeURIComponent(email);
    
    try {
    const response: AxiosResponse<ApiResponse<UserDto>> = await api.get(`/productivity/friend/search-user/${encodedEmail}`);
      
      if (response.data.data) {
        // Lưu vào userCache để sử dụng sau này
        if (response.data.data.userId) {
          this.userCache[response.data.data.userId] = response.data.data;
        }
      }
      
    return response.data.data;
    } catch (error) {
      console.error(`Error searching user by email ${email}:`, error);
      return null;
    }
  }

  // Thêm bạn bè
  async addFriend(friendId: string): Promise<Friend> {
    try {
    const response: AxiosResponse<ApiResponse<Friend>> = await api.post(`/productivity/friend/add/${friendId}`);
      // Xóa cache liên quan
      this.invalidateCache('sent');
    return response.data.data;
    } catch (error) {
      console.error(`Error adding friend ${friendId}:`, error);
      throw error;
    }
  }

  // Chấp nhận yêu cầu kết bạn
  async acceptFriend(friendId: string): Promise<Friend> {
    try {
    const response: AxiosResponse<ApiResponse<Friend>> = await api.put(`/productivity/friend/accept/${friendId}`);
      // Xóa cache liên quan
      this.invalidateCache('pending');
      this.invalidateCache('friends_');
    return response.data.data;
    } catch (error) {
      console.error(`Error accepting friend request ${friendId}:`, error);
      throw error;
    }
  }

  // Xem danh sách yêu cầu kết bạn đang chờ xử lý
  async viewAllPending(): Promise<Friend[]> {
    try {
    const response: AxiosResponse<ApiResponse<Friend[]>> = await api.get('/productivity/friend/view-all/pending');
    return response.data.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  }

  // Xem danh sách bạn bè đã chấp nhận
  async viewAllFriends(): Promise<Friend[]> {
    try {
      // Luôn gọi API khi cần load danh sách bạn bè
      console.log('viewAllFriends: Gọi API để lấy danh sách bạn bè');
      
      // Tạo một timeout để đảm bảo mạng có thời gian khởi tạo nếu mới load trang
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const response: AxiosResponse<ApiResponse<Friend[]>> = await api.get(`/productivity/friend/view-all`);
      
      console.log('viewAllFriends: Kết quả từ API:', response.data.data);
      
      // Nếu response rỗng, thử gọi lại sau 500ms
      if ((!response.data.data || response.data.data.length === 0) && !this.retryAttempt) {
        console.log('viewAllFriends: Không có dữ liệu, sẽ thử lại sau 500ms');
        this.retryAttempt = true;
        
        // Thử gọi lại sau một khoảng thời gian ngắn
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const retryResponse = await api.get(`/productivity/friend/view-all`);
              console.log('viewAllFriends: Kết quả thử lại:', retryResponse.data.data);
              this.retryAttempt = false;
              resolve(retryResponse.data.data);
            } catch (err) {
              console.error('viewAllFriends: Lỗi khi thử lại:', err);
              this.retryAttempt = false;
              resolve([]);
            }
          }, 500);
        });
      }
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching friends:`, error);
      return [];
    }
  }

  // Xem danh sách lời mời kết bạn đã gửi
  async viewAllSent(): Promise<Friend[]> {
    try {
      const cacheKey = 'sent_requests';
      const cachedData = this.getFromCache<Friend[]>(cacheKey);
      
      if (cachedData) {
        console.log('Returning cached sent requests');
        return cachedData;
      }
      
      console.log('Fetching sent requests from API');
      const response: AxiosResponse<ApiResponse<Friend[]>> = await api.get('/productivity/friend/view-all/sent');
      
      // Lưu kết quả vào cache
      this.saveToCache(cacheKey, response.data.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      return [];
    }
  }

  // Thu hồi yêu cầu kết bạn
  async cancelFriendRequest(friendId: string): Promise<Friend> {
    try {
    const response: AxiosResponse<ApiResponse<Friend>> = await api.delete(`/productivity/friend/cancel/${friendId}`);
      // Xóa cache liên quan
      this.invalidateCache('sent');
    return response.data.data;
    } catch (error) {
      console.error(`Error canceling friend request ${friendId}:`, error);
      throw error;
    }
  }

  // Xóa bạn bè đã chấp nhận
  async removeFriend(friendId: string): Promise<Friend> {
    try {
    const response: AxiosResponse<ApiResponse<Friend>> = await api.delete(`/productivity/friend/${friendId}`);
      // Xóa cache liên quan
      this.invalidateCache('friends_');
    return response.data.data;
    } catch (error) {
      console.error(`Error removing friend ${friendId}:`, error);
      throw error;
    }
  }
  
  async getUserById(userId: string): Promise<UserDto> {
    // Kiểm tra trong userCache trước
    if (this.userCache[userId]) {
      return this.userCache[userId];
    }
    
    try {
    const response: AxiosResponse<ApiResponse<UserDto>> = await api.get(`/auth/user/${userId}`);
      
      if (response.data.data) {
        // Lưu vào userCache
        this.userCache[userId] = response.data.data;
      }
      
    return response.data.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }
  
  // Manually refresh data
  clearCache(): void {
    this.cache = {};
  }
}

const FriendService = new FriendServiceClass();
export default FriendService;