// ===== API Client =====

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class HttpClient {
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

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Important for cookies
    });

    if (response.status === 401) {
      // Session expired or unauthorized
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
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

  get<T>(endpoint: string, options: RequestInit & { params?: Record<string, string> } = {}) {
    let finalEndpoint = endpoint;
    if (options.params) {
      const searchParams = new URLSearchParams(options.params);
      finalEndpoint += `?${searchParams.toString()}`;
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
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'x-client-type': 'web',
      },
      credentials: 'include',
    });

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
}

export const api = new HttpClient();
