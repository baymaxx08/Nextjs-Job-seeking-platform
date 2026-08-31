'use client';

import { useMemo, useState } from 'react';

import { StatusBadge } from './StatusBadge';

function ApplicantTable({ applications = [], onUpdateStatus, onDownloadResume }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const statusMatches = !statusFilter || application.status === statusFilter;
      const searchMatches =
        !search ||
        [
          application.full_name,
          application.seeker_email,
          application.headline,
          application.location,
        ].some((value) => value?.toLowerCase().includes(search.toLowerCase()));
      return statusMatches && searchMatches;
    });
  }, [applications, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      applied: applications.filter((a) => a.status === 'applied').length,
      shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
      interview: applications.filter((a) => a.status === 'interview').length,
      hired: applications.filter((a) => a.status === 'hired').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };
  }, [applications]);

  const getMatchPercentage = (application) => {
    const jobSkills = Array.isArray(application.job_skills) ? application.job_skills : [];
    const seekerSkills = Array.isArray(application.seeker_skills) ? application.seeker_skills : [];

    if (!jobSkills.length) {
      return 100;
    }

    const matchedSkills = jobSkills.filter((skill) =>
      seekerSkills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase())
    );
    return Math.round((matchedSkills.length / jobSkills.length) * 100);
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await onUpdateStatus(appId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Status Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: '', label: 'Total', count: stats.total, color: 'border-slate-200 bg-white text-slate-900' },
          { key: 'applied', label: 'Applied', count: stats.applied, color: 'border-sky-200 bg-sky-50 text-sky-950' },
          { key: 'shortlisted', label: 'Shortlisted', count: stats.shortlisted, color: 'border-amber-200 bg-amber-50 text-amber-950' },
          { key: 'interview', label: 'Interview', count: stats.interview, color: 'border-indigo-200 bg-indigo-50 text-indigo-950' },
          { key: 'hired', label: 'Selected / Hired', count: stats.hired, color: 'border-emerald-200 bg-emerald-50 text-emerald-950' },
          { key: 'rejected', label: 'Rejected', count: stats.rejected, color: 'border-rose-200 bg-rose-50 text-rose-950' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setStatusFilter(item.key)}
            className={`rounded-2xl border p-3.5 text-left transition hover:shadow-sm ${item.color} ${
              statusFilter === item.key ? 'ring-2 ring-slate-900' : ''
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">{item.label}</p>
            <p className="mt-1 text-2xl font-bold">{item.count}</p>
          </button>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              id="search-applicants-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-950 outline-none focus:border-slate-900 focus:bg-white transition shadow-sm"
              placeholder="Search candidate name, email, or headline..."
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              id="filter-applicant-status-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-950 outline-none focus:border-slate-900 transition shadow-sm"
            >
              <option value="">All Statuses ({applications.length})</option>
              <option value="applied">Applied ({stats.applied})</option>
              <option value="shortlisted">Shortlisted ({stats.shortlisted})</option>
              <option value="interview">Interview ({stats.interview})</option>
              <option value="hired">Selected / Hired ({stats.hired})</option>
              <option value="rejected">Rejected ({stats.rejected})</option>
            </select>
          </div>
        </div>

        {filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 pr-4">Candidate</th>
                  <th className="py-3.5 pr-4">Resume</th>
                  <th className="py-3.5 pr-4">Skills & Match</th>
                  <th className="py-3.5 pr-4">Current Status</th>
                  <th className="py-3.5 pr-4 text-right">Review & Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((application) => {
                  const match = getMatchPercentage(application);
                  const isUpdating = updatingId === application.id;

                  return (
                    <tr key={application.id} className="hover:bg-slate-50/70 transition">
                      {/* Candidate info */}
                      <td className="py-4 pr-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {(application.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-950 text-base">{application.full_name}</p>
                            <p className="text-xs text-slate-500 font-medium">{application.seeker_email}</p>
                            {application.headline && (
                              <p className="text-xs text-slate-600 mt-0.5 max-w-xs">{application.headline}</p>
                            )}
                            <p className="text-[11px] text-slate-400 mt-1">
                              Applied {new Date(application.applied_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Resume Download */}
                      <td className="py-4 pr-4 align-top">
                        {application.resume_file_name ? (
                          <div className="space-y-1.5">
                            <button
                              id={`download-resume-btn-${application.id}`}
                              type="button"
                              onClick={() => onDownloadResume(application.id, application.resume_file_name)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition"
                            >
                              <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate max-w-[140px]">{application.resume_file_name}</span>
                            </button>
                            {application.cover_letter && (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCandidate(application)}
                                  className="text-[11px] text-indigo-600 font-semibold hover:underline"
                                >
                                  Read Cover Letter
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No resume attached</span>
                        )}
                      </td>

                      {/* Skills & Match */}
                      <td className="py-4 pr-4 align-top">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  match >= 70 ? 'bg-emerald-500' : match >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                                }`}
                                style={{ width: `${match}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-900">{match}% match</span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(application.seeker_skills || []).slice(0, 3).map((skill) => (
                              <span key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                {skill}
                              </span>
                            ))}
                            {(application.seeker_skills || []).length > 3 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{application.seeker_skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Current Status */}
                      <td className="py-4 pr-4 align-top">
                        <StatusBadge status={application.status} />
                      </td>

                      {/* Action / Selection buttons */}
                      <td className="py-4 pr-4 align-top text-right">
                        <div className="flex flex-col items-end gap-2">
                          {/* Quick selection action buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {application.status !== 'shortlisted' && application.status !== 'hired' && application.status !== 'rejected' && (
                              <button
                                id={`action-shortlist-${application.id}`}
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(application.id, 'shortlisted')}
                                className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition disabled:opacity-50"
                              >
                                Shortlist
                              </button>
                            )}

                            {application.status !== 'interview' && application.status !== 'hired' && application.status !== 'rejected' && (
                              <button
                                id={`action-interview-${application.id}`}
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(application.id, 'interview')}
                                className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 transition disabled:opacity-50"
                              >
                                Interview
                              </button>
                            )}

                            {application.status !== 'hired' && (
                              <button
                                id={`action-hire-${application.id}`}
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(application.id, 'hired')}
                                className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-xs font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                              >
                                Select / Hire
                              </button>
                            )}

                            {application.status !== 'rejected' && (
                              <button
                                id={`action-reject-${application.id}`}
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(application.id, 'rejected')}
                                className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(application)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-900 transition"
                          >
                            View Full Candidate Profile →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-950">No candidates match this criteria</h3>
            <p className="mt-1 text-xs text-slate-500">
              {search || statusFilter ? 'Try clearing your filters or search keywords.' : 'No candidates have applied to this position yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div id="candidate-detail-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div id="candidate-detail-card" className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-[0_25px_70px_rgba(15,23,42,0.25)] border border-slate-100 my-8 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-lg">
                  {(selectedCandidate.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950">{selectedCandidate.full_name}</h2>
                  <p className="text-xs text-slate-500">{selectedCandidate.seeker_email} · {selectedCandidate.location || 'Location not specified'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Candidate Headline & Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold uppercase text-slate-400">Professional Headline</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedCandidate.headline || 'Not provided'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-semibold uppercase text-slate-400">Experience</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedCandidate.years_of_experience !== undefined ? `${selectedCandidate.years_of_experience} years` : 'Not specified'}
                </p>
              </div>
            </div>

            {/* Candidate Skills */}
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Candidate Skills</p>
              <div className="flex flex-wrap gap-2">
                {(selectedCandidate.seeker_skills || []).length > 0 ? (
                  selectedCandidate.seeker_skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No skills listed</span>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Cover Letter</p>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedCandidate.cover_letter || 'No cover letter submitted with this application.'}
              </div>
            </div>

            {/* Resume File & Status Selection */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
              {selectedCandidate.resume_file_name ? (
                <button
                  type="button"
                  onClick={() => onDownloadResume(selectedCandidate.id, selectedCandidate.resume_file_name)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-slate-50 transition"
                >
                  <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span>Download Resume ({selectedCandidate.resume_file_name})</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400">No resume attached</span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await handleStatusChange(selectedCandidate.id, 'shortlisted');
                    setSelectedCandidate((prev) => prev ? { ...prev, status: 'shortlisted' } : null);
                  }}
                  className="rounded-full bg-amber-100 text-amber-900 px-3.5 py-1.5 text-xs font-semibold hover:bg-amber-200 transition"
                >
                  Shortlist
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleStatusChange(selectedCandidate.id, 'interview');
                    setSelectedCandidate((prev) => prev ? { ...prev, status: 'interview' } : null);
                  }}
                  className="rounded-full bg-indigo-100 text-indigo-900 px-3.5 py-1.5 text-xs font-semibold hover:bg-indigo-200 transition"
                >
                  Interview
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleStatusChange(selectedCandidate.id, 'hired');
                    setSelectedCandidate((prev) => prev ? { ...prev, status: 'hired' } : null);
                  }}
                  className="rounded-full bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  Select / Hire
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleStatusChange(selectedCandidate.id, 'rejected');
                    setSelectedCandidate((prev) => prev ? { ...prev, status: 'rejected' } : null);
                  }}
                  className="rounded-full bg-rose-100 text-rose-900 px-3.5 py-1.5 text-xs font-semibold hover:bg-rose-200 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ApplicantTable };