import { Response } from 'express';
import { env } from '../../config/environment';

export interface CookieTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * Set authentication cookies (HttpOnly, Secure, SameSite=Strict)
 */
export function setAuthCookies(res: Response, tokens: CookieTokens): void {
  const isProduction = env.NODE_ENV === 'production';

  // Access token cookie - short-lived (15 minutes)
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });

  // Refresh token cookie - longer-lived (7 days)
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth', // Only sent to auth endpoints
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });
}

/**
 * Clear authentication cookies on logout
 */
export function clearAuthCookies(res: Response): void {
  const isProduction = env.NODE_ENV === 'production';

  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });

  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/api/v1/auth',
    domain: isProduction ? env.COOKIE_DOMAIN : undefined,
  });
}

/**
 * Extract access token from cookie
 */
export function getAccessTokenFromCookie(cookies: Record<string, string> | undefined): string | null {
  return cookies?.[ACCESS_TOKEN_COOKIE] || null;
}

/**
 * Extract refresh token from cookie
 */
export function getRefreshTokenFromCookie(cookies: Record<string, string> | undefined): string | null {
  return cookies?.[REFRESH_TOKEN_COOKIE] || null;
}
