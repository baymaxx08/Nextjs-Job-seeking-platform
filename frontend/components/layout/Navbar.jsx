'use client';

import Link from 'next/link';

import { NotificationBell } from './NotificationBell';
import { useAuth } from '../../hooks/useAuth';

function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-slate-950">
          Job Portal
        </Link>

        <nav className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <Link href="/jobs" className="rounded-full px-3 py-2 hover:bg-slate-100">
            Jobs
          </Link>
          {isAuthenticated && role === 'seeker' ? (
            <Link href="/seeker/dashboard" className="rounded-full px-3 py-2 hover:bg-slate-100">
              Seeker dashboard
            </Link>
          ) : null}
          {isAuthenticated && role === 'provider' ? (
            <Link href="/provider/dashboard" className="rounded-full px-3 py-2 hover:bg-slate-100">
              Provider dashboard
            </Link>
          ) : null}
          <NotificationBell />
          {isAuthenticated ? (
            <button type="button" onClick={logout} className="rounded-full bg-slate-950 px-4 py-2 text-white">
              Sign out
            </button>
          ) : (
            <Link href="/login" className="rounded-full bg-slate-950 px-4 py-2 text-white">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export { Navbar };