import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import notificationService from '../services/notificationService';
import { useStore } from '../store/useStore';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  target: string;
  priority: string;
  sender: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  readAt: string | null;
  emailSent: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  totalPages: number;
  currentPage: number;
  fetchNotifications: (page?: number, unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (data: {
    title: string;
    message: string;
    type: string;
    target: string;
    priority?: string;
    targetUsers?: string[];
    targetEvent?: string;
  }) => Promise<any>;
  socket: Socket | null;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Use window.location to determine socket URL in production, fallback to localhost for dev
const SOCKET_URL = (window as any).__ENV__?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useStore();

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      console.log('[Notification Socket] Connected:', newSocket.id);
      setIsConnected(true);
      newSocket.emit('user:online', user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('[Notification Socket] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('admin:notification', (notification: any) => {
      console.log('[Notification Socket] New notification received:', notification);
      // Add to notifications list
      setNotifications((prev) => [
        {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'information',
          target: notification.target || 'all',
          priority: notification.priority || 'medium',
          sender: notification.sender || 'EventNexus Admin',
          createdAt: notification.createdAt || new Date().toISOString(),
          updatedAt: notification.createdAt || new Date().toISOString(),
          isRead: false,
          readAt: null,
          emailSent: false,
        },
        ...prev,
      ]);
      // Update unread count
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on('notification:unread-count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  // Fetch unread count on mount and periodically
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('[NotificationContext] Error fetching unread count:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, unreadOnly = false) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await notificationService.getUserNotifications(page, 20, unreadOnly);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      console.error('[NotificationContext] Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[NotificationContext] Error marking as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => (n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationContext] Error marking all as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('[NotificationContext] Error deleting notification:', err);
    }
  }, []);

  // Send notification (admin)
  const sendNotification = useCallback(async (data: {
    title: string;
    message: string;
    type: string;
    target: string;
    priority?: string;
    targetUsers?: string[];
    targetEvent?: string;
  }) => {
    const result = await notificationService.sendNotification(data);
    return result;
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        totalPages,
        currentPage,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sendNotification,
        socket,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}