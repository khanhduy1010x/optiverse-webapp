import { ApiResponse } from '../types/api/api.interface';
import { CacheItem } from '../types/friend/friend.types';
import { Friend, UserDto } from '../types/friend/response/friend.response';
import api from './api.service';
import { AxiosResponse } from 'axios';

class FriendServiceClass {
  private cache: Record<string, CacheItem<any>> = {};
  private cacheDuration = 10000; // Giảm xuống còn 10 giây (từ 60000ms)
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
  private saveToCache<T>(
    key: string,
    data: T,
    expiresIn: number = this.cacheDuration
  ): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      expiresIn,
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
      const cacheKey = `friends_by_user_${userId}`;
      const cachedData = this.getFromCache<Friend[]>(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response: AxiosResponse<ApiResponse<Friend[]>> = await api.get(
        `/productivity/friend/user/${userId}`
      );
      
      // Cache kết quả với thời gian ngắn
      this.saveToCache(cacheKey, response.data.data, 5000); // Chỉ cache 5 giây
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching friends for user ${userId}:`, error);
      return [];
    }
  }

  // Tạo yêu cầu kết bạn
  async createFriendRequest(dto: CreateFriendRequest): Promise<Friend> {
    const response: AxiosResponse<ApiResponse<{ friend: Friend }>> =
      await api.post('/productivity/friend/create', dto);
    // Xóa cache liên quan
    this.invalidateCache('friends_');
    this.invalidateCache('sent');
    return response.data.data.friend;
  }

  // Cập nhật trạng thái bạn bè
  async updateFriend(
    friendId: string,
    dto: UpdateFriendRequest
  ): Promise<Friend> {
    const response: AxiosResponse<ApiResponse<{ friend: Friend }>> =
      await api.put(`/productivity/friend/update/${friendId}`, dto);
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
    // Loại bỏ khoảng trắng ở đầu và cuối email
    const cleanedEmail = email.trim();
    const encodedEmail = encodeURIComponent(cleanedEmail);

    try {
      const response: AxiosResponse<ApiResponse<UserDto>> = await api.get(
        `/productivity/friend/search-user/${encodedEmail}`
      );

      if (response.data.data) {
        // Lưu vào userCache để sử dụng sau này
        if (response.data.data.userId) {
          this.userCache[response.data.data.userId] = response.data.data;
        }
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error searching user by email ${cleanedEmail}:`, error);
      return null;
    }
  }

  // Thêm bạn bè
  async addFriend(friendId: string): Promise<Friend> {
    try {
      const response: AxiosResponse<ApiResponse<Friend>> = await api.post(
        `/productivity/friend/add/${friendId}`
      );
      // Xóa cache liên quan để đảm bảo dữ liệu mới
      this.invalidateCache('sent');
      this.invalidateCache('friends_');
      this.invalidateCache('pending');
      return response.data.data;
    } catch (error) {
      console.error(`Error adding friend ${friendId}:`, error);
      throw error;
    }
  }

  // Chấp nhận yêu cầu kết bạn
  async acceptFriend(friendId: string): Promise<Friend> {
    try {
      const response: AxiosResponse<ApiResponse<Friend>> = await api.put(
        `/productivity/friend/accept/${friendId}`
      );
      // Xóa cache liên quan
      this.invalidateCache('pending');
      this.invalidateCache('friends_');
      this.invalidateCache('sent');
      return response.data.data;
    } catch (error) {
      console.error(`Error accepting friend request ${friendId}:`, error);
      throw error;
    }
  }

  // Xem danh sách yêu cầu kết bạn đang chờ xử lý
  async viewAllPending(): Promise<Friend[]> {
    try {
      // Luôn truy vấn trực tiếp từ backend mà không sử dụng cache
      const response: AxiosResponse<ApiResponse<Friend[]>> = await api.get(
        '/productivity/friend/view-all/pending'
      );
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

      const response: AxiosResponse<ApiResponse<Friend[]>> = await api.get(
        `/productivity/friend/view-all`
      );

      console.log('viewAllFriends: Kết quả từ API:', response.data.data);

      // Nếu response rỗng, thử gọi lại sau 500ms
      if (
        (!response.data.data || response.data.data.length === 0) &&
        !this.retryAttempt
      ) {
        console.log('viewAllFriends: Không có dữ liệu, sẽ thử lại sau 500ms');
        this.retryAttempt = true;

        // Thử gọi lại sau một khoảng thời gian ngắn
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              const retryResponse = await api.get(
                `/productivity/friend/view-all`
              );
              console.log(
                'viewAllFriends: Kết quả thử lại:',
                retryResponse.data.data
              );
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
      // Luôn truy vấn trực tiếp từ backend mà không sử dụng cache
      console.log('Fetching sent requests from API');
      const response: AxiosResponse<ApiResponse<Friend[]>> = await api.get(
        '/productivity/friend/view-all/sent'
      );

      return response.data.data;
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      return [];
    }
  }

  // Thu hồi yêu cầu kết bạn
  async cancelFriendRequest(friendId: string): Promise<Friend> {
    try {
      const response: AxiosResponse<ApiResponse<Friend>> = await api.delete(
        `/productivity/friend/cancel/${friendId}`
      );
      // Xóa cache liên quan
      this.invalidateCache('sent');
      this.invalidateCache('pending');
      this.invalidateCache('friends_');
      return response.data.data;
    } catch (error) {
      console.error(`Error canceling friend request ${friendId}:`, error);
      throw error;
    }
  }

  // Xóa bạn bè
  async removeFriend(friendId: string): Promise<Friend> {
    try {
      const response: AxiosResponse<ApiResponse<Friend>> = await api.delete(
        `/productivity/friend/${friendId}`
      );
      // Xóa tất cả các cache liên quan để đảm bảo dữ liệu mới
      this.invalidateCache('friends_');
      this.invalidateCache('sent');
      this.invalidateCache('pending');
      return response.data.data;
    } catch (error) {
      console.error(`Error removing friend ${friendId}:`, error);
      throw error;
    }
  }

  // Lấy thông tin user theo ID
  async getUserById(userId: string): Promise<UserDto> {
    try {
      // Kiểm tra trong cache trước
    if (this.userCache[userId]) {
      return this.userCache[userId];
    }

      const response: AxiosResponse<ApiResponse<UserDto>> = await api.get(
        `/productivity/friend/user-by-id/${userId}`
      );

      if (response.data.data) {
        // Cache user info cho lần sử dụng tiếp theo
        this.userCache[userId] = response.data.data;
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

  // Xóa tất cả cache
  clearCache(): void {
    console.log('Clearing all friend service cache');
    this.cache = {};
    // Chỉ giữ lại cache user info vì nó ít thay đổi
  }

  // Xóa cache relationships cụ thể
  clearRelationshipsCache(): void {
    console.log('Clearing relationships cache');
    Object.keys(this.cache).forEach(key => {
      if (key.startsWith('relationships_')) {
        delete this.cache[key];
      }
    });
  }

  // Lấy tất cả mối quan hệ (cả hai chiều) liên quan đến một user
  async getAllRelationshipsWithUser(userId: string): Promise<{
    isFriend: boolean;
    friendRelation?: Friend;
    pendingIncoming?: Friend;
    sentRequest?: Friend;
  }> {
    try {
      // Tạm thời tắt cache để luôn gọi API mới
      console.log(`getAllRelationshipsWithUser: Gọi API cho user ${userId}`);
      
      const response: AxiosResponse<ApiResponse<{
        isFriend: boolean;
        friendRelation?: Friend;
        pendingIncoming?: Friend;
        sentRequest?: Friend;
      }>> = await api.get(`/productivity/friend/relationships/${userId}`);

      console.log(`getAllRelationshipsWithUser: API response cho user ${userId}:`, response.data.data);

      const { isFriend, friendRelation, pendingIncoming, sentRequest } = response.data.data;

      const result = {
        isFriend,
        friendRelation,
        pendingIncoming,
        sentRequest
      };

      // Tạm thời không cache để đảm bảo luôn có dữ liệu mới
      // this.saveToCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Error getting relationships with user ${userId}:`, error);
      return { isFriend: false };
    }
  }

  /**
   * Lấy danh sách Friend suggestion (friends of friends)
   * @returns Promise<Friend[]> - Danh sách Friend suggestion
   */
  async getFriendSuggestions(): Promise<Friend[]> {
    try {
      const cacheKey = 'friend_suggestions';
      const cached = this.getFromCache<Friend[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const response: AxiosResponse<ApiResponse<Friend[]>> = await api.get(
        '/productivity/friend/suggestions'
      );

      const suggestions = response.data.data;
      this.saveToCache(cacheKey, suggestions, 30000); // Cache 30 giây cho suggestions
      return suggestions;
    } catch (error) {
      console.error('Error getting friend suggestions:', error);
      return [];
    }
  }
}

const FriendService = new FriendServiceClass();
export default FriendService;
