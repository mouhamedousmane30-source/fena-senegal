import { API_URL, TOKEN_KEY, REFRESH_TOKEN_KEY } from './api.config';
import { ApiError } from './api.config';

class ApiClient {
  private token: string | null =
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

  /**
   * Injecte les tokens et les persiste
   */
  setTokens(token: string, refreshToken?: string, storage: 'local' | 'session' = 'local') {
    this.token = token;
    if (storage === 'local') {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Supprime les traces de connexion
   */
  clearTokens() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Méthode de requête générique avec injection automatique du header
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers = new Headers(options.headers);

    // Injection immédiate du token si présent
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let data: Record<string, unknown> | undefined;
      const ct = response.headers.get('content-type');
      if (ct?.includes('application/json')) {
        try {
          data = (await response.json()) as Record<string, unknown>;
        } catch {
          /* corps vide ou JSON invalide */
        }
      }
      throw ApiError.fromResponse(response.status, data);
    }

    return response.json();
  }

  async get<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'GET' }); }
  async post<T>(endpoint: string, data: any) { return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  async put<T>(endpoint: string, data: any) { return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
  async delete<T>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
}

export const apiClient = new ApiClient();