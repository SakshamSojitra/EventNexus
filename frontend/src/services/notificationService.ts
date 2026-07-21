import API from '../utils/api';

const notificationService = {
  // ─── User Endpoints ───────────────────────────────────────

  // Get user notifications with pagination
  getUserNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const { data } = await API.get('/user/notifications', {
      params: { page, limit, unreadOnly: unreadOnly ? 'true' : 'false' },
    });
    return data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const { data } = await API.get('/user/notifications/unread-count');
    return data;
  },

  // Mark a single notification as read
  markAsRead: async (notificationId: string) => {
    const { data } = await API.patch(`/user/notifications/${notificationId}/read`);
    return data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const { data } = await API.patch('/user/notifications/read-all');
    return data;
  },

  // Delete a notification
  deleteNotification: async (notificationId: string) => {
    const { data } = await API.delete(`/user/notifications/${notificationId}`);
    return data;
  },

  // ─── Admin Endpoints ─────────────────────────────────────

  // Send a notification
  sendNotification: async (notificationData: {
    title: string;
    message: string;
    type: string;
    target: string;
    priority?: string;
    targetUsers?: string[];
    targetEvent?: string;
    expiresAt?: string;
  }) => {
    const { data } = await API.post('/admin/notifications/send', notificationData);
    return data;
  },

  // Get notification history (admin)
  getNotificationHistory: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    target?: string;
    status?: string;
    from?: string;
    to?: string;
  }) => {
    const { data } = await API.get('/admin/notifications/history', { params });
    return data;
  },

  // Get notification statistics (admin)
  getNotificationStatistics: async () => {
    const { data } = await API.get('/admin/notifications/statistics');
    return data;
  },

  // Get notification recipients (admin)
  getNotificationRecipients: async (notificationId: string) => {
    const { data } = await API.get(`/admin/notifications/recipients/${notificationId}`);
    return data;
  },

  // Resend failed emails
  resendEmails: async (notificationId: string) => {
    const { data } = await API.post(`/admin/notifications/${notificationId}/resend`);
    return data;
  },

  // Legacy: Get simple notification list
  getNotificationsLegacy: async () => {
    const { data } = await API.get('/admin/notifications');
    return data;
  },
};

export default notificationService;