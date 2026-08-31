import Link from 'next/link';

import { JobStatusBadge } from './JobStatusBadge';

function JobCard({ job }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <JobStatusBadge status={job.status} />
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{job.company?.name || 'Company name not available'}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right text-xs text-slate-600">
          <p>{job.is_remote ? 'Remote' : job.location || 'Onsite'}</p>
          <p className="mt-1 font-semibold text-slate-950">{job.job_type}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {(job.skills || []).slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {skill}
          </span>
        ))}
        {job.required_skill_count > 4 ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">+{job.required_skill_count - 4} more</span> : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {job.currency} {job.salary_min || 'N/A'} - {job.currency} {job.salary_max || 'N/A'}
          </p>
          <p className="text-xs text-slate-500">Posted {new Date(job.created_at).toLocaleDateString()}</p>
        </div>
        <Link href={`/jobs/${job.id}`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          View details
        </Link>
      </div>
    </article>
  );
}

export { JobCard };