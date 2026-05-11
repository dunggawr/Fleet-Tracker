import { useAuthStore } from '@/store/useAuthStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

let refreshInFlight: Promise<string | null> | null = null;

function withAuthHeader(headers: HeadersInit | undefined, token: string) {
  if (headers instanceof Headers) {
    const next = new Headers(headers);
    next.set('Authorization', `Bearer ${token}`);
    return next;
  }

  if (Array.isArray(headers)) {
    const next = new Headers(headers);
    next.set('Authorization', `Bearer ${token}`);
    return next;
  }

  return {
    ...(headers || {}),
    Authorization: `Bearer ${token}`,
  };
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const { refreshToken, updateTokens, logout } = useAuthStore.getState();

    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        logout();
        return null;
      }

      const data = await response.json();
      const payload = data?.data ?? data;
      const accessToken = payload?.accessToken ?? payload?.access_token;
      const newRefreshToken =
        payload?.refreshToken ?? payload?.refresh_token ?? refreshToken;

      if (!accessToken) {
        logout();
        return null;
      }

      updateTokens(accessToken, newRefreshToken);
      return accessToken;
    } catch {
      logout();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function authFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const { token } = useAuthStore.getState();
  const url = `${API_URL}${endpoint}`;

  const requestOptions: RequestInit = {
    ...options,
    headers: token ? withAuthHeader(options.headers, token) : options.headers,
  };

  let response = await fetch(url, requestOptions);

  if (response.status !== 401) {
    return response;
  }

  const newAccessToken = await refreshAccessToken();
  if (!newAccessToken) {
    return response;
  }

  response = await fetch(url, {
    ...options,
    headers: withAuthHeader(options.headers, newAccessToken),
  });

  return response;
}
