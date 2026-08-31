'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useAuth } from '../../../hooks/useAuth';
import { useJobs } from '../../../hooks/useJobs';
import { useSeeker } from '../../../hooks/useSeeker';
import { useApplications } from '../../../hooks/useApplications';
import { JobStatusBadge } from '../../../components/jobs/JobStatusBadge';
import { ApplyModal } from '../../../components/forms/ApplyModal';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const { resumes, fetchProfile, uploadResume } = useSeeker();
  const { job, loading, error, fetchJob } = useJobs();
  const { applications, savedJobs, loading: applicationLoading, fetchApplications, fetchSavedJobs, applyToJob, saveJob, removeSavedJob } = useApplications();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchJob(params.id);
    }
  }, [params?.id, fetchJob]);

  useEffect(() => {
    if (isAuthenticated && role === 'seeker') {
      fetchProfile();
      fetchApplications();
      fetchSavedJobs();
    }
  }, [isAuthenticated, role, fetchProfile, fetchApplications, fetchSavedJobs]);

  const jobId = Number(params?.id);
  const alreadyApplied = useMemo(() => applications.some((application) => Number(application.job_id) === jobId), [applications, jobId]);
  const alreadySaved = useMemo(() => savedJobs.some((savedJob) => Number(savedJob.job_id) === jobId), [savedJobs, jobId]);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (role !== 'seeker') {
      router.push('/provider/dashboard');
      return;
    }

    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (values) => {
    const application = await applyToJob(job.id, {
      resumeId: Number(values.resumeId),
      coverLetter: values.coverLetter,
    });

    if (application) {
      setIsApplyModalOpen(false);
      await fetchApplications();
      router.push('/seeker/applications');
    }
  };

  const toggleSavedJob = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (role !== 'seeker') {
      return;
    }

    if (alreadySaved) {
      await removeSavedJob(job.id);
      return;
    }

    await saveJob(job.id);
  };

  if (loading) {
    return <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 text-sm text-slate-600 lg:px-8">Loading job details...</main>;
  }

  if (error) {
    return <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 text-sm text-rose-700 lg:px-8">{error}</main>;
  }

  if (!job) {
    return <main className="mx-auto min-h-screen max-w-4xl px-4 py-10 text-sm text-slate-600 lg:px-8">Job not found.</main>;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <JobStatusBadge status={job.status} />
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{job.job_type}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{job.is_remote ? 'Remote' : job.location || 'Onsite'}</span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-slate-950">{job.title}</h1>
          <p className="mt-3 text-sm text-slate-600">{job.company?.name} · {job.company?.industry || 'Industry not listed'}</p>

          <div className="mt-6 space-y-6 text-sm leading-7 text-slate-700">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Description</h2>
              <p className="mt-2 whitespace-pre-line">{job.description}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">Requirements</h2>
              <p className="mt-2 whitespace-pre-line">{job.requirements}</p>
            </div>

            {job.responsibilities ? (
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Responsibilities</h2>
                <p className="mt-2 whitespace-pre-line">{job.responsibilities}</p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Compensation</p>
            <h2 className="mt-3 text-3xl font-semibold">{job.currency} {job.salary_min || 'N/A'} - {job.currency} {job.salary_max || 'N/A'}</h2>
            <p className="mt-2 text-sm text-slate-300">{job.experience_level} level · {job.company?.location || job.location || 'Location not specified'}</p>
            <div className="mt-6 space-y-3">
              <button onClick={handleApplyClick} disabled={alreadyApplied} className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
                {alreadyApplied ? 'Already applied' : 'Apply'}
              </button>
              <button onClick={toggleSavedJob} className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                {alreadySaved ? 'Remove saved job' : 'Save job'}
              </button>
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-300">Application flow will unlock in the next step. For now, the listing and detail experience is connected end-to-end.</p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <h3 className="text-lg font-semibold text-slate-950">Skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(job.skills || []).length ? job.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {skill}
                </span>
              )) : <span className="text-sm text-slate-500">No skills tagged yet.</span>}
            </div>
          </div>
        </aside>
      </div>

      <ApplyModal
        open={isApplyModalOpen}
        job={job}
        resumes={resumes}
        loading={applicationLoading}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmit={handleApplySubmit}
        onUploadResume={uploadResume}
      />
    </main>
  );
}