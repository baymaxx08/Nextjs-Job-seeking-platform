import { useCallback } from 'react';

import { api } from '../lib/api';
import { useNotificationStore } from '../store/notificationStore';

function useNotifications() {
  const { notifications, unreadCount, setNotifications, markNotificationRead, markAllRead } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    const response = await api.get('/notifications');
    const payload = response.data?.data || {};
    setNotifications(payload.notifications || []);
    return payload.notifications || [];
  }, [setNotifications]);

  const markAsRead = useCallback(async (id) => {
    await api.put(`/notifications/${id}/read`);
    markNotificationRead(id);
  }, [markNotificationRead]);

  const markAllAsRead = useCallback(async () => {
    await api.put('/notifications/read-all');
    markAllRead();
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