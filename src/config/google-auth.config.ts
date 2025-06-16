// Google OAuth Configuration
export const GOOGLE_AUTH_CONFIG = {
  CLIENT_ID:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '984716139241-ho7qi5j29rn5f0asfnerblkq8ch5qtl1.apps.googleusercontent.com',
  REDIRECT_URI:
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    'https://optiverse.io.vn/auth/google/callback',
};
