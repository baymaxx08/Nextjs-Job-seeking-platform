'use client';

import { useEffect } from 'react';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { SavedJobCard } from '../../../components/jobs/SavedJobCard';
import { useApplications } from '../../../hooks/useApplications';

function SeekerSavedJobsPage() {
  const { savedJobs, fetchSavedJobs, removeSavedJob } = useApplications();

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  return (
    <ProtectedRoute allowedRole="seeker">
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Saved jobs</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">Bookmark roles for later</h1>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {savedJobs.map((job) => (
              <SavedJobCard key={job.id} job={job} onRemove={removeSavedJob} />
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default SeekerSavedJobsPage;