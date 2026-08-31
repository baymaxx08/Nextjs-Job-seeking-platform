'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../../hooks/useAuth';

function ProtectedRoute({ allowedRole, children }) {
  const router = useRouter();
  const { role, isAuthenticated, hasHydrated } = useAuth();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRole && role !== allowedRole) {
      router.push(role === 'provider' ? '/provider/dashboard' : '/seeker/dashboard');
    }
  }, [allowedRole, hasHydrated, isAuthenticated, role, router]);

  if (!hasHydrated || !isAuthenticated || (allowedRole && role !== allowedRole)) {
    return <div className="min-h-screen" />;
  }

  return children;
}

export { ProtectedRoute };