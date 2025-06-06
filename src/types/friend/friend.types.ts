import { Friend, UserDto } from './response/friend.response';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}
export interface FriendState {
  friends: Friend[];
  sentRequests: Friend[];
  pendingRequests: Friend[];
  searchedUsers: UserDto[];
  users: Record<string, UserDto>; // Lưu thông tin user theo userId
  error: string | null;
  loading: boolean;
}
