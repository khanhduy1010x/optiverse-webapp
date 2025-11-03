// File: D:\optiverse\webapp\src\store\slices\authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '../../types/admin/user.types';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    _id?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role?: UserRole;
    membership?: {
      packageName?: string;
      level?: number;
      hasActiveMembership?: boolean;
      endDate?: string;
    };
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('accessToken'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: state => {
      state.isAuthenticated = true;
    },
    logout: state => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user_id');
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;

export default authSlice.reducer;
