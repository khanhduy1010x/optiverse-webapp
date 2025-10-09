const isProd = import.meta.env.VITE_APP_ENV === 'production';
export const BASE_URL = isProd
  ? import.meta.env.VITE_URL_BASE_PROD
  : import.meta.env.VITE_URL_BASE;

export const GOOGLE_REDIRECT_URI = isProd
  ? import.meta.env.VITE_GOOGLE_REDIRECT_URI_PROD
  : import.meta.env.VITE_GOOGLE_REDIRECT_URI;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
