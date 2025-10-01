// Định nghĩa các interface cho Friend

export interface FriendUserInfo {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Friend {
  _id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt?: string;
  updatedAt?: string;
  friendInfo?: FriendUserInfo;
}

export interface UserDto {
  userId: string;
  email: string;
  _id?: string;
  full_name?: string;
}
