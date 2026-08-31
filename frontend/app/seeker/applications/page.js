'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { ApplicationCard } from '../../../components/applications/ApplicationCard';
import { useApplications } from '../../../hooks/useApplications';

function SeekerApplicationsPage() {
  const { applications, loading, fetchApplications, withdrawApplication } = useApplications();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const counts = useMemo(() => {
    return {
      all: applications.length,
      active: applications.filter((a) => ['applied', 'shortlisted', 'interview'].includes(a.status)).length,
      shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
      interview: applications.filter((a) => a.status === 'interview').length,
      hired: applications.filter((a) => a.status === 'hired').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      let matchesFilter = true;
      if (activeFilter === 'active') {
        matchesFilter = ['applied', 'shortlisted', 'interview'].includes(app.status);
      } else if (activeFilter !== 'all') {
        matchesFilter = app.status === activeFilter;
      }

      const matchesSearch = !searchQuery || [
        app.title,
        app.company_name,
        app.job_location,
        app.status,
      ].some((val) => val?.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [applications, activeFilter, searchQuery]);

  return (
    <ProtectedRoute allowedRole="seeker">
      <main id="seeker-applications-page" className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
                Seeker Dashboard
              </span>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
                Application Tracker
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Real-time status tracking for all your job submissions and employer reviews.
              </p>
            </div>
            <Link
              id="browse-more-jobs-btn"
              href="/jobs"
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-sm"
            >
              Browse More Jobs →
            </Link>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: counts.all },
                { key: 'active', label: 'In Progress', count: counts.active },
                { key: 'shortlisted', label: 'Shortlisted', count: counts.shortlisted },
                { key: 'interview', label: 'Interview', count: counts.interview },
                { key: 'hired', label: 'Selected / Hired', count: counts.hired },
                { key: 'rejected', label: 'Closed', count: counts.rejected },
              ].map((tab) => (
                <button
                  key={tab.key}
                  id={`filter-tab-${tab.key}`}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeFilter === tab.key
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72">
              <input
                id="search-applications-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-950 placeholder-slate-400 outline-none focus:border-slate-900 transition shadow-sm"
              />
            </div>
          </div>

          {/* Applications List */}
          {loading && !applications.length ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              <p className="text-sm">Loading applications...</p>
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="grid gap-5">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onWithdraw={withdrawApplication}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-950">No applications found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                {searchQuery || activeFilter !== 'all'
                  ? 'No applications match your selected filters. Try changing your search query or filter tab.'
                  : 'You have not submitted any job applications yet. Browse open positions and submit your resume to start tracking!'}
              </p>
              <div className="mt-6">
                <Link
                  id="empty-state-browse-jobs-btn"
                  href="/jobs"
                  className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
                >
                  Explore Open Jobs
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default SeekerApplicationsPage;