'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { useProvider } from '../../../hooks/useProvider';

function ProviderDashboardPage() {
  const { allApplications, fetchAllApplications } = useProvider();

  useEffect(() => {
    fetchAllApplications();
  }, [fetchAllApplications]);

  const applicationsThisWeek = allApplications.filter((application) => new Date(application.applied_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000).length;

  return (
    <ProtectedRoute allowedRole="provider">
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 p-8 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Provider dashboard</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Manage your jobs</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Post new job openings, track applications, and manage your hiring pipeline.</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/provider/jobs/new" className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
                + Post a new job
              </Link>
              <Link href="/provider/jobs" className="rounded-full border border-amber-400 bg-transparent px-6 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-400 hover:text-slate-950">
                View your jobs
              </Link>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-slate-500">Applications this week</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{applicationsThisWeek}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <p className="text-sm text-slate-500">Total applications</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{allApplications.length}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-semibold text-slate-950">Recent applications</h2>
            {allApplications.length === 0 ? (
              <div className="mt-4 py-8 text-center">
                <p className="text-slate-600">No applications yet. Post a job to start receiving applications!</p>
                <Link href="/provider/jobs/new" className="mt-3 inline-block rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Post your first job
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {allApplications.slice(0, 5).map((application) => (
                  <div key={application.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-950">{application.full_name} · {application.title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs capitalize">
                        Status: <span className="font-semibold">{application.status}</span>
                      </p>
                      <p className="text-xs text-slate-500">{new Date(application.applied_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default ProviderDashboardPage;