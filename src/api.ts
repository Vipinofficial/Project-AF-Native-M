import { createApiClient } from '@arli/api-client';

/**
 * The one API client for this app. EXPO_PUBLIC_API_URL is inlined at build time.
 * On a physical device "localhost" is the DEVICE — use your machine's LAN IP.
 */
export const api = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL as string,
});
