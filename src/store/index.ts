import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import sidebarReducer from './slices/sidebarSlice';
import themeReducer from './slices/themeSlice';
import noteReducer from './slices/noteSlice';
import folderReducer from './slices/folderSlice';
import uiReducer from './slices/uiSlice';
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    sidebar: sidebarReducer,
    theme: themeReducer,
    notes: noteReducer,
    folders: folderReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
