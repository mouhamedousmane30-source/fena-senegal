import { apiClient } from './api.client';

/**
 * Services pour les utilisateurs
 */

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  bio?: string;
  phone?: string;
  verified: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  phone?: string;
  profileImage?: File;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    if (data.profileImage) {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.bio) formData.append('bio', data.bio);
      if (data.phone) formData.append('phone', data.phone);
      formData.append('profileImage', data.profileImage);

      return apiClient.request('/user/profile', {
        method: 'PUT',
        body: formData,
      });
    }

    return apiClient.put('/user/profile', {
      name: data.name,
      bio: data.bio,
      phone: data.phone,
    });
  },

  /**
   * Changer le mot de passe
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return apiClient.put('/user/password', data);
  },

  /**
   * Obtenir les données de sécurité
   */
  async getSecurityData(): Promise<{
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    loginHistory: Array<{ ip: string; userAgent: string; timestamp: string }>;
  }> {
    return apiClient.get('/user/security');
  },

  /**
   * Activer 2FA
   */
  async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    return apiClient.post('/user/2fa/enable', {});
  },

  /**
   * Désactiver 2FA
   */
  async disableTwoFactor(code: string): Promise<{ message: string }> {
    return apiClient.post('/user/2fa/disable', { code });
  },

  /**
   * Obtenir les préférences utilisateur
   */
  async getPreferences(): Promise<{
    notifications: { email: boolean; push: boolean };
    privacy: { announcements: 'public' | 'private' | 'friends' };
  }> {
    return apiClient.get('/user/preferences');
  },

  /**
   * Mettre à jour les préférences
   */
  async updatePreferences(data: any): Promise<any> {
    return apiClient.put('/user/preferences', data);
  },

  /**
   * Supprimer le compte
   */
  async deleteAccount(): Promise<{ message: string }> {
    return apiClient.delete('/user/account');
  },
};
