import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FriendState } from '../../types/friend/friend.types';
import { Friend, UserDto } from '../../types/friend/response/friend.response';

const initialState: FriendState = {
  friends: [],
  sentRequests: [],
  pendingRequests: [],
  searchedUsers: [],
  suggestions: [], // Khởi tạo suggestions
  users: {}, // Khởi tạo users
  error: null,
  loading: false,
};

const friendSlice = createSlice({
  name: 'friend',
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<Friend[]>) => {
      state.friends = action.payload;
      state.loading = false;
    },
    setSentRequests: (state, action: PayloadAction<Friend[]>) => {
      state.sentRequests = action.payload;
      state.loading = false;
    },
    setPendingRequests: (state, action: PayloadAction<Friend[]>) => {
      state.pendingRequests = action.payload;
      state.loading = false;
    },
    setSearchedUsers: (state, action: PayloadAction<UserDto[]>) => {
      state.searchedUsers = action.payload;
      state.loading = false;
    },
    setSuggestions: (state, action: PayloadAction<Friend[]>) => {
      state.suggestions = action.payload;
      state.loading = false;
    },
    setUser: (state, action: PayloadAction<UserDto>) => {
      state.users[action.payload.userId] = action.payload; // Lưu user vào users
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addFriend: (state, action: PayloadAction<Friend>) => {
      // Kiểm tra xem yêu cầu đã tồn tại chưa để tránh trùng lặp
      const exists = state.sentRequests.some(
        req =>
          req._id === action.payload._id ||
          (req.friend_id === action.payload.friend_id &&
            req.status === 'pending')
      );

      if (!exists) {
        state.sentRequests.push(action.payload);
      }
    },
    acceptFriend: (state, action: PayloadAction<Friend>) => {
      state.pendingRequests = state.pendingRequests.filter(
        req => req._id !== action.payload._id
      );
      state.friends.push(action.payload);
    },
    cancelFriendRequest: (state, action: PayloadAction<string>) => {
      state.sentRequests = state.sentRequests.filter(
        req => req._id !== action.payload
      );
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(
        friend => friend._id !== action.payload
      );
    },
  },
});

export const {
  setFriends,
  setSentRequests,
  setPendingRequests,
  setSearchedUsers,
  setSuggestions,
  setUser, // Xuất setUser
  setError,
  setLoading,
  addFriend,
  acceptFriend,
  cancelFriendRequest,
  removeFriend,
} = friendSlice.actions;

export default friendSlice.reducer;
