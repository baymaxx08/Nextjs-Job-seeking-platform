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
            <button type="button" onClick={markAllAsRead} className="text-xs font-semibold text-slate-600 underline-offset-4 hover:underline">
              Mark all read
            </button>
          </div>

          <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
            {notifications.length ? notifications.map((notification) => (
              <button key={notification.id} type="button" onClick={() => markAsRead(notification.id)} className={`w-full rounded-2xl border p-3 text-left text-sm transition ${notification.is_read ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-900 bg-slate-950 text-white'}`}>
                <p className="font-semibold">{notification.type}</p>
                <p className="mt-1 text-xs leading-5 opacity-90">{notification.message}</p>
              </button>
            )) : <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">No notifications yet.</p>}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { NotificationBell };