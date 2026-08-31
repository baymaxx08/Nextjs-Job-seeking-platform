'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { useAuth } from '../../../hooks/useAuth';
import { useSeeker } from '../../../hooks/useSeeker';
import { useApplications } from '../../../hooks/useApplications';

function SeekerDashboardPage() {
  const { user } = useAuth();
  const { resumes, fetchProfile } = useSeeker();
  const { applications, savedJobs, fetchApplications, fetchSavedJobs } = useApplications();

  useEffect(() => {
    fetchProfile();
    fetchApplications();
    fetchSavedJobs();
  }, [fetchProfile, fetchApplications, fetchSavedJobs]);

  const shortlistedCount = applications.filter((application) => application.status === 'shortlisted').length;

  return (
    <ProtectedRoute allowedRole="seeker">
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Seeker dashboard</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">
              Welcome back{user?.profile?.full_name ? `, ${user.profile.full_name}` : ''}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Track applications, keep your resume updated, and return to bookmarked jobs at any time.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Applications', applications.length],
              ['Shortlisted', shortlistedCount],
              ['Saved jobs', savedJobs.length],
              ['Resumes', resumes.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950">Recent applications</h2>
                <Link href="/seeker/applications" className="text-sm font-semibold text-slate-950 underline-offset-4 hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {applications.slice(0, 3).map((application) => (
                  <div key={application.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-950">{application.title}</p>
                    <p className="mt-1">{application.company_name}</p>
                    <p className="mt-1 capitalize">Status: {application.status}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-950">Recent saved jobs</h2>
                <Link href="/seeker/saved-jobs" className="text-sm font-semibold text-slate-950 underline-offset-4 hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {savedJobs.slice(0, 3).map((savedJob) => (
                  <div key={savedJob.id} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-950">{savedJob.title}</p>
                    <p className="mt-1">{savedJob.company_name}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 p-8 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <h2 className="text-2xl font-semibold">Ready to find your next role?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Browse open job opportunities, save positions for later, and apply to roles that interest you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/jobs" className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
                Browse jobs
              </Link>
              <Link href="/seeker/saved-jobs" className="rounded-full border border-amber-400 bg-transparent px-6 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-400 hover:text-slate-950">
                My saved jobs ({savedJobs.length})
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-950">Manage your profile and resume</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Keep your profile current, upload multiple resumes, and set one as your default before applying to roles.
            </p>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default SeekerDashboardPage;