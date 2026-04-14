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

export interface SiteViews {
  totalPageViews: number;
  totalUniqueVisitors: number;
  todayPageViews: number;
  todayUniqueVisitors: number;
  last7DaysPageViews: number;
  last7DaysUniqueVisitors: number;
}

export interface Notification {
  _id: string;
  type: 'user_registered' | 'announcement_created' | 'announcement_reported' | 'announcement_deleted' | 'user_deleted' | 'system';
  title: string;
  message: string;
  data: {
    userId?: string;
    announcementId?: string;
    additionalInfo?: any;
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  link?: string;
  createdAt: string;
}

export interface SiteStatsResponse {
  totals: {
    totalPageViews: number;
    totalUniqueVisitors: number;
  };
  today: {
    pageViews: number;
    uniqueVisitors: number;
    date: string;
  };
  period: Array<{
    date: string;
    pageViews: number;
    uniqueVisitors: number;
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
  },

  // ============================================
  // STATS DE VUES DU SITE
  // ============================================
  
  async getSiteStats(period: number = 7): Promise<{ success: boolean; stats: SiteStatsResponse }> {
    const response = await apiClient.get(`/admin/site-stats?period=${period}`) as { success: boolean; stats: SiteStatsResponse };
    return response;
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  
  async getNotifications(options?: { limit?: number; unreadOnly?: boolean }): Promise<{ 
    success: boolean; 
    notifications: Notification[]; 
    unreadCount: number 
  }> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get(`/admin/notifications${queryString}`) as { 
      success: boolean; 
      notifications: Notification[]; 
      unreadCount: number 
    };
    return response;
  },

  async getUnreadNotificationsCount(): Promise<{ success: boolean; count: number }> {
    const response = await apiClient.get('/admin/notifications/unread-count') as { success: boolean; count: number };
    return response;
  },

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; notification: Notification }> {
    const response = await apiClient.put(`/admin/notifications/${notificationId}/read`, {}) as { 
      success: boolean; 
      notification: Notification 
    };
    return response;
  },

  async markAllNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put('/admin/notifications/read-all', {}) as { success: boolean; message: string };
    return response;
  },

  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/admin/notifications/${notificationId}`) as { success: boolean; message: string };
    return response;
  }
};
