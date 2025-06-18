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

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
