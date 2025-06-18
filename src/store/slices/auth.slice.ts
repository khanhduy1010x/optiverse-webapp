// File: D:\optiverse\webapp\src\store\slices\authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, UserResponse } from '../../types/auth/auth.types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    clearUser: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const { setUser, clearUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
