import Link from 'next/link';

import { StatusBadge } from './StatusBadge';
import { StatusTimeline } from './StatusTimeline';

function ApplicationCard({ application, onWithdraw }) {
  return (
    <article className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <StatusBadge status={application.status} />
          <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{application.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{application.company_name}</p>
        </div>
        <Link href={`/jobs/${application.job_id}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
          View job
        </Link>
      </div>

      <StatusTimeline status={application.status} />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <p>Applied on {new Date(application.applied_at).toLocaleDateString()}</p>
        {application.status === 'applied' ? (
          <button type="button" onClick={() => onWithdraw(application.id)} className="rounded-full bg-rose-50 px-4 py-2 font-semibold text-rose-700 transition hover:bg-rose-100">
            Withdraw
          </button>
        ) : null}
      </div>
    </article>
  );
}

export { ApplicationCard };