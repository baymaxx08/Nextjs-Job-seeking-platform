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
      const notifications = state.notifications.map((notification) =>
        notification.id === id ? { ...notification, is_read: true } : notification
      );

      return {
        notifications,
        unreadCount: notifications.filter((notification) => !notification.is_read).length,
      };
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, is_read: true })),
      unreadCount: 0,
    })),
}));

export { useNotificationStore };