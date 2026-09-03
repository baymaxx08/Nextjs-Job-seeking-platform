'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { useProvider } from '../../../hooks/useProvider';
import { StatusBadge } from '../../../components/applications/StatusBadge';
import { ResumeViewerModal } from '../../../components/applications/ResumeViewerModal';

function ProviderDashboardPage() {
  const {
    jobs,
    fetchJobs,
    allApplications,
    fetchAllApplications,
    updateApplicationStatus,
    downloadApplicationResume,
  } = useProvider();

  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchAllApplications();
  }, [fetchJobs, fetchAllApplications]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await updateApplicationStatus(appId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadResume = async (applicationId, fileName) => {
    try {
      await downloadApplicationResume(applicationId, fileName || 'candidate-resume.pdf');
    } catch (err) {
      console.error('Failed to download resume:', err);
    }
  };

  const shortlistedCount = allApplications.filter((a) => a.status === 'shortlisted').length;
  const hiredCount = allApplications.filter((a) => a.status === 'hired').length;
  const onHoldCount = allApplications.filter((a) => a.status === 'on_hold').length;

  return (
    <ProtectedRoute allowedRole="provider">
      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 lg:px-8">
        <div className="space-y-8">
          {/* Header Banner */}
          <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 p-8 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Employer & Hiring Center</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Provider Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Manage your company job listings, review applicant resumes, and track candidates from screening to offer.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/provider/jobs/new"
                className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 shadow-sm"
              >
                + Post a New Job
              </Link>
              <Link
                href="/provider/profile"
                className="rounded-full border border-slate-600 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Edit Company Profile
              </Link>
            </div>
          </section>

          {/* Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Jobs Posted</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{jobs.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Applications</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{allApplications.length}</p>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Shortlisted</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-amber-950">{shortlistedCount}</p>
            </div>
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Approved / Hired</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-950">{hiredCount}</p>
            </div>
          </div>

          {/* Jobs Posted by Provider */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Jobs Posted by Your Company</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your active postings and click any job to review its applicants.
                </p>
              </div>
              <Link
                href="/provider/jobs/new"
                className="rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                + Post Job
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-slate-600">No jobs posted yet.</p>
                <Link
                  href="/provider/jobs/new"
                  className="mt-3 inline-block rounded-full bg-slate-950 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                >
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
                {jobs.map((job) => {
                  const jobAppCount = allApplications.filter((a) => a.job_id === job.id).length;

                  return (
                    <div
                      key={job.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-950 text-base">{job.title}</h3>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            {job.is_active !== false ? 'Active' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {job.location || 'Remote'} · {job.job_type || 'Full-time'} · Posted{' '}
                          {new Date(job.created_at || Date.now()).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/provider/jobs/${job.id}/applications`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2 text-xs font-bold text-indigo-900 hover:bg-indigo-100 transition shadow-sm"
                        >
                          <span>Review Applicants</span>
                          <span className="rounded-full bg-indigo-200/80 px-2 py-0.5 text-[10px] font-extrabold text-indigo-950">
                            {jobAppCount}
                          </span>
                        </Link>
                        <Link
                          href={`/provider/jobs/${job.id}/edit`}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                        >
                          View Listing →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Candidate Applications & Resumes Section */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">All Candidate Applications & Resumes</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Inspect candidate resumes, view document previews, and update status (Shortlist, On Hold, Approve, Reject).
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {allApplications.length} Total Applicants
              </span>
            </div>

            {allApplications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-slate-600">No applications received yet.</p>
                <p className="mt-1 text-xs text-slate-400">
                  When job seekers apply to any of your listings, their profiles and resumes will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="pb-3 pr-4">Candidate & Role</th>
                      <th className="pb-3 pr-4">Resume Document</th>
                      <th className="pb-3 pr-4">Current Status</th>
                      <th className="pb-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allApplications.map((app) => {
                      const isUpdating = updatingId === app.id;

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/70 transition">
                          {/* Candidate info */}
                          <td className="py-4 pr-4 align-top">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {(app.full_name || 'C').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-950 text-sm">{app.full_name}</p>
                                <p className="text-xs text-slate-500">{app.seeker_email}</p>
                                <p className="mt-1 text-xs font-medium text-indigo-700">Role: {app.title}</p>
                                <p className="text-[11px] text-slate-400">
                                  Applied {new Date(app.applied_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Resume document actions */}
                          <td className="py-4 pr-4 align-top">
                            <div className="flex flex-col sm:flex-row items-start gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingCandidate(app)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition shadow-sm"
                                title="Preview resume document"
                              >
                                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View Resume</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadResume(app.id, app.resume_file_name || 'Resume.pdf')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                                title="Download resume PDF"
                              >
                                <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate max-w-[100px]">{app.resume_file_name || 'Resume.pdf'}</span>
                              </button>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 pr-4 align-top">
                            <StatusBadge status={app.status} />
                          </td>

                          {/* Status Action Buttons */}
                          <td className="py-4 align-top text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {app.status !== 'shortlisted' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(app.id, 'shortlisted')}
                                  className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition disabled:opacity-50"
                                >
                                  Shortlist
                                </button>
                              )}

                              {app.status !== 'interview' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(app.id, 'interview')}
                                  className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 transition disabled:opacity-50"
                                >
                                  Interview
                                </button>
                              )}

                              {app.status !== 'on_hold' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(app.id, 'on_hold')}
                                  className="rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-xs font-semibold text-purple-800 hover:bg-purple-100 transition disabled:opacity-50"
                                >
                                  On Hold
                                </button>
                              )}

                              {app.status !== 'hired' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(app.id, 'hired')}
                                  className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-xs font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                                >
                                  Approve
                                </button>
                              )}

                              {app.status !== 'rejected' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(app.id, 'rejected')}
                                  className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Resume Viewer Modal */}
          {viewingCandidate && (
            <ResumeViewerModal
              open={Boolean(viewingCandidate)}
              onClose={() => setViewingCandidate(null)}
              candidate={viewingCandidate}
              onUpdateStatus={async (appId, newStatus) => {
                await handleStatusChange(appId, newStatus);
                setViewingCandidate((cur) => (cur ? { ...cur, status: newStatus } : null));
              }}
            />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default ProviderDashboardPage;