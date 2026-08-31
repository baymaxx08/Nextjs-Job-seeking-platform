import { useCallback } from 'react';

import { api } from '../lib/api';
import { useNotificationStore } from '../store/notificationStore';

function useNotifications() {
  const { notifications, unreadCount, setNotifications, markNotificationRead, markAllRead } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      const payload = response.data?.data || {};
      setNotifications(payload.notifications || []);
      return payload.notifications || [];
    } catch {
      return [];
    }
  }, [setNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      markNotificationRead(id);
    } catch {
      // ignore
    }
  }, [markNotificationRead]);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      markAllRead();
    } catch {
      // ignore
    }
  }, [markAllRead]);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

export { useNotifications };