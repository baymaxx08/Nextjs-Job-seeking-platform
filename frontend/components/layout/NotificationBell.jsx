'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

function NotificationBell() {
  const { isAuthenticated, hasHydrated } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      fetchNotifications();
    }
  }, [hasHydrated, isAuthenticated, fetchNotifications]);

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className="relative rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-950">
        Notifications
        {unreadCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">{unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-40 w-96 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-950">Notifications</h3>
            {notifications.length > 0 ? (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-slate-600 underline-offset-4 hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
            {notifications.length ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="group relative flex items-start justify-between gap-3 rounded-2xl border border-slate-900 bg-slate-950 p-3 text-left text-sm text-white transition hover:bg-slate-900"
                >
                  <div className="flex-1">
                    <p className="font-semibold capitalize text-amber-300">
                      {notification.type.replace(/_/g, ' ')}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{notification.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    title="Dismiss notification"
                    className="mt-0.5 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/20 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                <p>No new notifications.</p>
                <p className="mt-1 text-xs text-slate-400">All caught up!</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { NotificationBell };