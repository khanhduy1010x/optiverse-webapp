import React from 'react';
import { IconName } from '../../../assets/icons';
import { Friend } from '../response/friend.response';

export interface AllFriendsProps {
  friends: Friend[];
  loading: boolean;
  onRemoveFriend: (id: string) => void;
  renderUserInfo: (userId: string, showId?: boolean) => React.ReactNode;
  onRefresh?: () => void | Promise<void>;
  onStartChat?: (friendId: string) => void | Promise<void>;
}

export interface ErrorDisplayProps {
  error: string | null;
  loading: boolean;
}

export interface FriendHeaderProps {
  activeTab: string;
  loading: boolean;
  onRefresh: () => void | Promise<void>;
}

export interface FriendSidebarProps {
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  currentUser: any;
}

export interface SidebarItem {
  key: string;
  label: string;
  icon: IconName;
  path: string;
}

export interface PendingRequestsProps {
  pendingRequests: Friend[];
  loading: boolean;
  onAcceptFriend: (id: string) => void;
  renderUserInfo: (userId: string, showId?: boolean) => React.ReactNode;
}

export interface SearchUsersProps {
  searchEmail: string;
  onSearchEmailChange: (email: string) => void;
  onSearch: () => void;
  searchedUsers: any[];
  loading: boolean;
  onAddFriend: (userId: string) => void;
  onCancelRequest: (id: string) => void;
  onRemoveFriend: (id: string) => void;
  renderUserInfo: (userId: string, showId?: boolean) => React.ReactNode;
  friends: any[];
  sentRequests: any[];
  pendingRequests?: any[];
  onAcceptRequest?: (id: string) => void;
  userId?: string;
  refreshFriendData?: () => void;
}

export interface SentRequestsProps {
  sentRequests: Friend[];
  loading: boolean;
  onCancelRequest: (id: string) => void;
  renderUserInfo: (userId: string, showId?: boolean) => React.ReactNode;
}
