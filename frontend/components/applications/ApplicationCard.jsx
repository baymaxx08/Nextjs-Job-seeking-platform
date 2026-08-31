import Link from 'next/link';
import { useState } from 'react';

import { StatusBadge } from './StatusBadge';
import { StatusTimeline } from './StatusTimeline';

function ApplicationCard({ application, onWithdraw }) {
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const getStatusAdvice = (status) => {
    switch (status) {
      case 'applied':
        return {
          title: 'Under Review',
          text: 'Your application has been received by the employer and is in the initial screening stage.',
          badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
        };
      case 'shortlisted':
        return {
          title: 'Candidate Shortlisted',
          text: 'Great news! Your profile and qualifications stood out and have been shortlisted by the hiring team.',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'interview':
        return {
          title: 'Interview Stage',
          text: 'You have been selected for an interview. The employer will reach out with scheduling details.',
          badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        };
      case 'hired':
        return {
          title: 'Offer / Selected',
          text: 'Congratulations! You have been selected for this position.',
          badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        };
      case 'rejected':
        return {
          title: 'Application Closed',
          text: 'The employer has concluded review for this role and decided to proceed with other applicants.',
          badgeBg: 'bg-rose-50 text-rose-900 border-rose-200',
        };
      default:
        return null;
    }
  };

  const advice = getStatusAdvice(application.status);

  return (
    <article id={`application-card-${application.id}`} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] hover:border-slate-300 transition">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={application.status} />
            {application.job_type && (
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700">
                {application.job_type}
              </span>
            )}
            {application.is_remote !== undefined && (
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700">
                {application.is_remote ? 'Remote' : application.job_location || 'Onsite'}
              </span>
            )}
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{application.title}</h3>
          <p className="mt-1 text-sm font-medium text-slate-600">{application.company_name}</p>
        </div>
        <Link
          id={`view-job-link-${application.job_id}`}
          href={`/jobs/${application.job_id}`}
          className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition shadow-sm"
        >
          View Job Listing →
        </Link>
      </div>

      {/* Interactive visual progress tracker */}
      <div className="pt-2">
        <StatusTimeline status={application.status} />
      </div>

      {/* Real-time Status Callout Box */}
      {advice && (
        <div className={`rounded-2xl border p-4 text-sm ${advice.badgeBg}`}>
          <p className="font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-current"></span>
            {advice.title}
          </p>
          <p className="mt-1 leading-relaxed opacity-90">{advice.text}</p>
        </div>
      )}

      {/* Resume and Cover Letter Info */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-slate-200 p-2 text-slate-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Submitted Resume</p>
              <p className="font-semibold text-slate-950">
                {application.resume_file_name || 'Resume on File'}
              </p>
            </div>
          </div>

          {application.cover_letter && (
            <button
              type="button"
              onClick={() => setShowCoverLetter(!showCoverLetter)}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 underline underline-offset-2"
            >
              {showCoverLetter ? 'Hide Cover Letter' : 'View Cover Letter'}
            </button>
          )}
        </div>

        {showCoverLetter && application.cover_letter && (
          <div className="pt-3 border-t border-slate-200 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-xl">
            {application.cover_letter}
          </div>
        )}
      </div>

      {/* Footer info & withdraw */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <p>Applied on {new Date(application.applied_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        {application.status === 'applied' && onWithdraw ? (
          <button
            id={`withdraw-btn-${application.id}`}
            type="button"
            onClick={() => onWithdraw(application.id)}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 font-semibold text-rose-700 hover:bg-rose-100 transition"
          >
            Withdraw Application
          </button>
        ) : null}
      </div>
    </article>
  );
}

export { ApplicationCard };