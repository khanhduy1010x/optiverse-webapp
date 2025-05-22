import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import sidebarReducer from './slices/sidebarSlice';
import themeReducer from './slices/themeSlice'; 

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    sidebar: sidebarReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;