import { apiClient } from './api.client';

export interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalAnnouncements: number;
  activeAnnouncements: number;
  recentUsers: Array<{
    _id: string;
    username: string;
    email: string;
    createdAt: string;
  }>;
  recentAnnouncements: Array<{
    _id: string;
    title: string;
    status: string;
    location: string;
    createdAt: string;
    user: {
      username: string;
      email: string;
    };
  }>;
}

export interface AdminUser {
  _id: string;
  username: string;
  name?: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  verified?: boolean;
  isActive?: boolean;
}

export interface AdminAnnouncement {
  _id: string;
  title: string;
  description: string;
  status: 'perdu' | 'trouvé';
  category: string;
  location: string;
  createdAt: string;
  user: {
    username: string;
    email: string;
    name?: string;
    verified?: boolean;
  };
  views: number;
  isActive: boolean;
}

export interface AdminReports {
  period: number;
  newUsers: number;
  newAnnouncements: number;
  announcementsByStatus: Array<{
    _id: string;
    count: number;
  }>;
  announcementsByCategory: Array<{
    _id: string;
    count: number;
  }>;
  topUsers: Array<{
    username: string;
    email: string;
    count: number;
  }>;
}

export const adminService = {
  // Statistiques générales
  async getStats(): Promise<{ success: boolean; stats: AdminStats }> {
    const response = await apiClient.get('/admin/stats') as { success: boolean; stats: AdminStats };
    return response;
  },

  // Gestion des utilisateurs
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{ 
    success: boolean; 
    users: AdminUser[]; 
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);

    const response = await apiClient.get(`/admin/users?${queryParams.toString()}`) as { 
      success: boolean; 
      users: AdminUser[]; 
      pagination: any;
    };
    return response;
  },

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ success: boolean; user: AdminUser; message: string }> {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role }) as { success: boolean; user: AdminUser; message: string };
    return response;
  },

  async verifyUser(userId: string, verified: boolean): Promise<{ success: boolean; user: AdminUser; message: string }> {
    const response = await apiClient.put(`/admin/users/${userId}/verify`, { verified }) as { success: boolean; user: AdminUser; message: string };
    return response;
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/admin/users/${userId}`) as { success: boolean; message: string };
    return response;
  },

  // Gestion des annonces
  async getAnnouncements(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Promise<{ 
    success: boolean; 
    announcements: AdminAnnouncement[]; 
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);

    const response = await apiClient.get(`/admin/announcements?${queryParams.toString()}`) as { 
      success: boolean; 
      announcements: AdminAnnouncement[]; 
      pagination: any;
    };
    return response;
  },

  async updateAnnouncementStatus(announcementId: string, status: string, isActive: boolean): Promise<{ success: boolean; announcement: AdminAnnouncement; message: string }> {
    const response = await apiClient.put(`/admin/announcements/${announcementId}/status`, { status, isActive }) as { success: boolean; announcement: AdminAnnouncement; message: string };
    return response;
  },

  async deleteAnnouncement(announcementId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/admin/announcements/${announcementId}`) as { success: boolean; message: string };
    return response;
  },

  // Rapports et analyses
  async getReports(period: number = 30): Promise<{ success: boolean; reports: AdminReports }> {
    const response = await apiClient.get(`/admin/reports?period=${period}`) as { success: boolean; reports: AdminReports };
    return response;
  }
};
