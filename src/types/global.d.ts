// Khai báo kiểu cho các biến global
import { Store } from '@reduxjs/toolkit';

declare global {
  interface Window {
    store: Store;
    showUserBannedModal?: () => void;
    __adminScrollEl?: HTMLElement | null;
  }
}

export {};
