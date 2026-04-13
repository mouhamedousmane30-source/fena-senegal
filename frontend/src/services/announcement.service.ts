import { apiClient } from './api.client';

/**
 * Services pour les annonces alignés sur le backend `/api/announcements`.
 */

export interface AnnouncementResponse {
  id: string;
  title: string;
  description: string;
  status: 'perdu' | 'trouvé';
  location: string;
  category: 'documents' | 'objets' | 'animaux' | 'personnes' | 'autres';
  images: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    preferredContact?: 'phone' | 'email';
  };
  coordinates: {
    lat?: number;
    lng?: number;
  };
  date: string;
  views: number;
  isActive: boolean;
  user?: {
    username: string;
    name?: string;
    verified?: boolean;
  };
}

export interface CreateAnnouncementRequest {
  title: string;
  description: string;
  status: 'perdu' | 'trouvé';
  location: string;
  category?: 'documents' | 'objets' | 'animaux' | 'personnes' | 'autres';
  images?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    preferredContact?: 'phone' | 'email';
  };
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

export const announcementService = {
  async getAnnouncements(): Promise<AnnouncementResponse[]> {
    const response = await apiClient.get('/announcements/public') as { success: boolean; announcements: AnnouncementResponse[] };
    return response.announcements;
  },

  async getSimilarAnnouncements(category: string, excludeId: string, limit: number = 4): Promise<AnnouncementResponse[]> {
    const response = await apiClient.get(`/announcements/public?category=${category}&limit=${limit + 1}`) as { success: boolean; announcements: AnnouncementResponse[] };
    // Filtrer l'annonce actuelle et limiter le nombre de résultats
    return response.announcements
      .filter((ann) => ann.id !== excludeId)
      .slice(0, limit);
  },

  async getAnnouncement(id: string): Promise<AnnouncementResponse> {
    const response = await apiClient.get(`/announcements/${id}`) as { success: boolean; announcement: AnnouncementResponse };
    return response.announcement;
  },

  async createAnnouncement(data: CreateAnnouncementRequest): Promise<AnnouncementResponse> {
    const response = await apiClient.post('/announcements', data) as { success: boolean; announcement: AnnouncementResponse };
    return response.announcement;
  },

  async getUserAnnouncements(): Promise<AnnouncementResponse[]> {
    const response = await apiClient.get('/announcements/my') as { success: boolean; announcements: AnnouncementResponse[] };
    return response.announcements;
  },

  async updateAnnouncement(id: string, data: Partial<CreateAnnouncementRequest>): Promise<AnnouncementResponse> {
    const response = await apiClient.put(`/announcements/${id}`, data) as { success: boolean; announcement: AnnouncementResponse };
    return response.announcement;
  },

  async deleteAnnouncement(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/announcements/${id}`);
  },
};
