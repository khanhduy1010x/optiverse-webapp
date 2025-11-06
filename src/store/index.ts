import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import counterReducer from './slices/counter.slice';
import sidebarReducer from './slices/sidebar.slice';
import uiReducer from './slices/ui.slice';
import itemsReducer from './slices/items.slice';
import themeReducer from './slices/theme.slice';
import authReducer from './slices/auth.slice';
import friendReducer from './slices/friend.slice';
import blogReducer from './slices/blog.slice';
import workspaceReducer from './slices/workspaceslice';
import workspaceTaskReducer from './slices/workspace_task.slice';
import workspaceNoteReducer from './slices/workspaceNoteSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Chỉ persist auth state
};

const rootReducer = combineReducers({
  counter: counterReducer,
  sidebar: sidebarReducer,
  theme: themeReducer,
  ui: uiReducer,
  items: itemsReducer,
  auth: authReducer,
  friend: friendReducer,
  blog: blogReducer,
  workspace: workspaceReducer,
  workspaceTask: workspaceTaskReducer,
  workspaceNote: workspaceNoteReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Gán store vào window để có thể truy cập từ bất kỳ đâu
window.store = store;

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
