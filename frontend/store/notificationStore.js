import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.is_read).length,
    }),
  markNotificationRead: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((notification) => notification.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((notification) => !notification.is_read).length,
      };
    }),
  markAllRead: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
  removeNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter((notification) => notification.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((notification) => !notification.is_read).length,
      };
    }),
  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));

export { useNotificationStore };