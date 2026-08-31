import Link from 'next/link';

function SavedJobCard({ job, onRemove }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Saved</p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{job.company_name}</p>
        </div>
        <button type="button" onClick={() => onRemove(job.job_id)} className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
          Remove
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{job.description}</p>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
        <span>{job.is_remote ? 'Remote' : job.location || 'Onsite'}</span>
        <Link href={`/jobs/${job.job_id}`} className="font-semibold text-slate-950 underline-offset-4 hover:underline">
          View details
        </Link>
      </div>
    </article>
  );
}

export { SavedJobCard };