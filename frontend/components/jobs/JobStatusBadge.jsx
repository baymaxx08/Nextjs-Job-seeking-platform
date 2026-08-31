function JobStatusBadge({ status }) {
  const styles = {
    open: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    closed: 'bg-amber-50 text-amber-700 ring-amber-200',
    filled: 'bg-slate-200 text-slate-700 ring-slate-300',
  };

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Open';

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status] || styles.open}`}>{label}</span>;
}

export { JobStatusBadge };