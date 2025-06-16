/**
 * Utility function to decode JWT tokens
 */

interface DecodedToken {
  sub: string;
  email: string;
  full_name: string;
  session_id: string;
  iat: number;
  exp: number;
}

/**
 * Decodes a JWT token and returns the payload
 * @param token The JWT token to decode
 * @returns The decoded token payload or null if invalid
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    if (!token) return null;

    // JWT tokens are in format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Checks if a token is expired
 * @param token The JWT token to check
 * @returns True if the token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  // exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Gets the session ID from a token
 * @param token The JWT token
 * @returns The session ID or null if not found
 */
export const getSessionId = (token: string): string | null => {
  const decoded = decodeToken(token);
  return decoded?.session_id || null;
};
