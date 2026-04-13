/**
 * Configuration API
 * À adapter selon votre backend
 */

// URL de base de l'API - Utilise la variable d'environnement ou localhost par défaut
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Debug: Log l'URL utilisée
console.log('[API Config] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('[API Config] API_URL utilisée:', API_URL);
// Timeouts
export const REQUEST_TIMEOUT = 30000;

// Clés localStorage
export const TOKEN_KEY = 'fena_token';
export const REFRESH_TOKEN_KEY = 'fena_refresh_token';
export const USER_KEY = 'fena_user';
export const REMEMBERED_EMAIL_KEY = 'fena_remembered_email';
export const REMEMBERED_PASSWORD_KEY = 'fena_remembered_password';

export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};


// Types d'erreurs
export enum ApiErrorType {
  NETWORK = 'NETWORK',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

// Classe d'erreur personnalisée
export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(status: number, data?: any): ApiError {
    let type = ApiErrorType.UNKNOWN;
    let message = 'Une erreur est survenue';

    if (status === 401) {
      type = ApiErrorType.UNAUTHORIZED;
      message =
        (typeof data?.message === 'string' && data.message) ||
        'Session expirée. Veuillez vous reconnecter.';
    } else if (status === 403) {
      type = ApiErrorType.FORBIDDEN;
      message = 'Accès refusé.';
    } else if (status === 404) {
      type = ApiErrorType.NOT_FOUND;
      message = 'Ressource non trouvée.';
    } else if (status === 400 || status === 422) {
      type = ApiErrorType.VALIDATION;
      message = data?.message || 'Données invalides.';
    } else if (status >= 500) {
      type = ApiErrorType.SERVER;
      // Afficher le message détaillé du serveur s'il existe
      message = data?.message || data?.error || 'Erreur serveur. Veuillez réessayer plus tard.';
      // Log en développement pour debug
      if (process.env.NODE_ENV === 'development') {
        console.error('[API ERROR 500+] Détails du serveur:', {
          status,
          message: data?.message,
          error: data?.error,
          fullData: data,
        });
      }
    } else if (status === 0) {
      type = ApiErrorType.NETWORK;
      message = 'Erreur réseau. Vérifiez votre connexion.';
    }

    return new ApiError(type, status, message, data);
  }
}
