import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counter.slice';
import sidebarReducer from './slices/sidebar.slice';

import uiReducer from './slices/ui.slice';
import itemsReducer from './slices/items.slice';
import themeReducer from './slices/theme.slice'; 
import authReducer from './slices/auth.slice'; // Thêm auth reducer
import friendReducer from './slices/friend.slice';
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
