import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import sidebarReducer from './slices/sidebarSlice';

import uiReducer from './slices/uiSlice';
import itemsReducer from './slices/itemsSlice';
import themeReducer from './slices/themeSlice'; 
import authReducer from './slices/authSlice'; // Thêm auth reducer
import friendReducer from './slices/friendSlice';
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    sidebar: sidebarReducer,
    theme: themeReducer,
    ui: uiReducer,
    items: itemsReducer,
    auth: authReducer, // Thêm vào store
    friend: friendReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
