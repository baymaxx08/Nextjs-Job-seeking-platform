function StatusBadge({ status }) {
  const variants = {
    applied: 'bg-sky-50 text-sky-700 ring-sky-200',
    shortlisted: 'bg-amber-50 text-amber-700 ring-amber-200',
    interview: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    hired: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  };

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Applied';

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${variants[status] || variants.applied}`}>{label}</span>;
}

export { StatusBadge };