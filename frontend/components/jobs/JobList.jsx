import { JobCard } from './JobCard';

function JobList({ jobs, loading, error }) {
  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600">Loading jobs...</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">{error}</div>;
  }

  if (!jobs.length) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600">No jobs found for the selected filters.</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export { JobList };