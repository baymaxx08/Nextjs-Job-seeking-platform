import Link from 'next/link';

import { JobStatusBadge } from './JobStatusBadge';

function ProviderJobCard({ job, onDelete }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <JobStatusBadge status={job.status} />
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{job.location || 'No location specified'} · {job.job_type}</p>
          <p className="mt-1 text-sm text-slate-500">Applications: {job.application_count || 0}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href={`/provider/jobs/${job.id}/applications`} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            Applicants
          </Link>
          <Link href={`/provider/jobs/${job.id}/edit`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-950">
            Edit
          </Link>
          <button type="button" onClick={() => onDelete(job.id)} className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export { ProviderJobCard };