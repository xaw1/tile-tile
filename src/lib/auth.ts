
const STORAGE_KEY = 'pollinations_user_key';
const APP_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY as string;

export function buildAuthUrl(): string {
  const params = new URLSearchParams({
    redirect_url: window.location.origin + window.location.pathname,
    app_key: APP_KEY,
  });
  return `https://enter.pollinations.ai/authorize?${params}`;
}

// Call on mount — reads api_key from URL hash fragment after Pollinations redirect
export function parseRedirectKey(): string | null {
  const hash = window.location.hash.slice(1);
  return new URLSearchParams(hash).get('api_key');
}

export function getStoredKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function clearStoredKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}
