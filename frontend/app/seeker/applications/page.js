'use client';

import { useEffect } from 'react';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { ApplicationCard } from '../../../components/applications/ApplicationCard';
import { useApplications } from '../../../hooks/useApplications';

function SeekerApplicationsPage() {
  const { applications, fetchApplications, withdrawApplication } = useApplications();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <ProtectedRoute allowedRole="seeker">
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Applications</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">Track every application</h1>
          </div>

          <div className="grid gap-5">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} onWithdraw={withdrawApplication} />
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default SeekerApplicationsPage;