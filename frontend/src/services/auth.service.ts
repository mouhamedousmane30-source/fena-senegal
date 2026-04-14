import { apiClient } from './api.client';

/**
 * Services d'authentification
 */

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role?: 'user' | 'admin';
    verified?: boolean;
  };
  token: string;
  refreshToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirm: string;
}

export interface VerifyResetTokenRequest {
  token: string;
}

export const authService = {
  /**
   * Connexion utilisateur
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/login', data);
  },

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/register', data);
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    return Promise.resolve();
  },

  /**
   * Obtenir le profil utilisateur actuel
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    return apiClient.get('/auth/me');
  },

  /**
   * Demander réinitialisation de mot de passe
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', data);
  },

  /**
   * Vérifier le token de réinitialisation
   */
  async verifyResetToken(token: string): Promise<{ message: string }> {
    return apiClient.get(`/reset-password/${token}`);
  },

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return apiClient.post(`/reset-password/${data.token}`, { 
      newPassword: data.password 
    });
  },

  /**
   * Vérifier l'email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post('/auth/verify-email', { token });
  },

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    return apiClient.post('/auth/resend-verification');
  },
};
