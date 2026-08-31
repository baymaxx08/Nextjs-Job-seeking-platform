'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { useJobs } from '../../hooks/useJobs';
import { JobFilters } from '../../components/jobs/JobFilters';
import { JobList } from '../../components/jobs/JobList';

export default function JobsPage() {
  const searchParams = useSearchParams();
  const { jobs, loading, error, pagination, fetchJobs } = useJobs();

  useEffect(() => {
    const filters = Object.fromEntries(searchParams.entries());
    fetchJobs(filters);
  }, [searchParams.toString(), fetchJobs]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Browse jobs</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Find your next role</h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 md:text-base">Search by role, company, location, experience level, and salary range to discover relevant openings.</p>
        </div>

        <JobFilters />

        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{pagination.total} jobs found</span>
          <span>
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
        </div>

        <JobList jobs={jobs} loading={loading} error={error} />
      </div>
    </main>
  );
}