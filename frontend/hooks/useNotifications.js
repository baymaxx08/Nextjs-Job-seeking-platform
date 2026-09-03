import { useCallback } from 'react';

import { api } from '../lib/api';
import { useNotificationStore } from '../store/notificationStore';

function useNotifications() {
  const { notifications, unreadCount, setNotifications, markNotificationRead, markAllRead } = useNotificationStore();

  const fetchNotifications = useCallback(async (includeRead = false) => {
    try {
      const response = await api.get('/notifications');
      const payload = response.data?.data || {};
      const all = payload.notifications || [];
      const visible = includeRead ? all : all.filter((n) => !n.is_read);
      setNotifications(visible);
      return all;
    } catch {
      return [];
    }
  }, [setNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
    } catch {
      // ignore
    } finally {
      markNotificationRead(id);
    }
  }, [markNotificationRead]);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
    } catch {
      // ignore
    } finally {
      markAllRead();
    }
  }, [markAllRead]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      // ignore
    } finally {
      markNotificationRead(id);
    }
  }, [markNotificationRead]);

  const clearAllNotifications = useCallback(async () => {
    try {
      await api.delete('/notifications');
    } catch {
      // ignore
    } finally {
      markAllRead();
    }
  }, [markAllRead]);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
}

export { useNotifications };