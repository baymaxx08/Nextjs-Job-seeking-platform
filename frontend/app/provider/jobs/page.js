'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { ProviderJobCard } from '../../../components/jobs/ProviderJobCard';
import { useProvider } from '../../../hooks/useProvider';

function ProviderJobsPage() {
  const { jobs, fetchJobs, deleteJob } = useProvider();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <ProtectedRoute allowedRole="provider">
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Jobs</p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">Manage your postings</h1>
            </div>
            <Link href="/provider/jobs/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              New job
            </Link>
          </div>

          <div className="grid gap-5">
            {jobs.map((job) => (
              <ProviderJobCard key={job.id} job={job} onDelete={deleteJob} />
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default ProviderJobsPage;