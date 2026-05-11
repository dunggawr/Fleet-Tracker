// ===== API Client =====

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class HttpClient {
  private refreshPromise: Promise<boolean> | null = null;

  private redirectToLogin() {
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      window.location.href = '/login';
    }
  }

  public async refreshSession(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-type': 'web',
          },
          credentials: 'include',
          body: JSON.stringify({}),
        });

        return response.ok;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async fetchWithRefresh(
    url: string,
    options: RequestInit,
    allowRetry = true,
  ): Promise<Response> {
    let response = await fetch(url, options);

    if (response.status !== 401 || !allowRetry || url.endsWith('/auth/refresh')) {
      return response;
    }

    const refreshed = await this.refreshSession();
    if (!refreshed) {
      return response;
    }

    response = await fetch(url, options);
    return response;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-client-type': 'web',
      ...options.headers,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Important for cookies
    };

    const response = await this.fetchWithRefresh(url, requestOptions);

    if (response.status === 401) {
      this.redirectToLogin();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error(`[API Error] ${options.method || 'GET'} ${url}:`, {
        status: response.status,
        payload: options.body,
        error
      });
      throw new Error(error?.error?.message || error?.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // Unwrap NestJS ResponseInterceptor format if present
    if (result && typeof result === 'object' && 'data' in result && 'statusCode' in result) {
      return result.data as T;
    }

    return result as T;
  }

  get<T>(endpoint: string, options: RequestInit & { params?: Record<string, string | number | boolean | undefined | null> } = {}) {
    let finalEndpoint = endpoint;
    if (options.params) {
      // Filter out undefined and null values
      const cleanParams: Record<string, string> = {};
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          cleanParams[key] = String(value);
        }
      });

      if (Object.keys(cleanParams).length > 0) {
        const searchParams = new URLSearchParams(cleanParams);
        finalEndpoint += `?${searchParams.toString()}`;
      }
    }
    return this.request<T>(finalEndpoint, options);
  }

  post<T>(endpoint: string, data?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const requestOptions: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {
        'x-client-type': 'web',
      },
      credentials: 'include',
    };

    const response = await this.fetchWithRefresh(url, requestOptions);

    if (response.status === 401) {
      this.redirectToLogin();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error?.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    // Unwrap NestJS ResponseInterceptor format if present
    if (result && typeof result === 'object' && 'data' in result && 'statusCode' in result) {
      return result.data as T;
    }

    return result as T;
  }
  async getBlob(endpoint: string, options: RequestInit & { params?: Record<string, string | number | boolean | undefined | null> } = {}): Promise<Blob> {
    let finalEndpoint = endpoint;
    if (options.params) {
      // Filter out undefined and null values
      const cleanParams: Record<string, string> = {};
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          cleanParams[key] = String(value);
        }
      });

      if (Object.keys(cleanParams).length > 0) {
        const searchParams = new URLSearchParams(cleanParams);
        finalEndpoint += `?${searchParams.toString()}`;
      }
    }
    
    const url = `${API_BASE}${finalEndpoint}`;
    const headers: HeadersInit = {
      'x-client-type': 'web',
      ...options.headers,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    const response = await this.fetchWithRefresh(url, requestOptions);

    if (response.status === 401) {
      this.redirectToLogin();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error?.message || `HTTP ${response.status}`);
    }

    return response.blob();
  }
}

export const api = new HttpClient();
