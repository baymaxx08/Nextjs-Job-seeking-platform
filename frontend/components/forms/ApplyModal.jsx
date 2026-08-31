'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

function ApplyModal({ open, job, resumes, loading, onClose, onSubmit }) {
  const defaultResumeId = resumes.find((resume) => resume.is_default)?.id || resumes[0]?.id || '';

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      resumeId: defaultResumeId,
      coverLetter: '',
    },
  });

  useEffect(() => {
    reset({
      resumeId: defaultResumeId,
      coverLetter: '',
    });
  }, [defaultResumeId, reset, job?.id]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Apply</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{job?.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Select resume</span>
            <select {...register('resumeId', { required: true })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900">
              {resumes.length ? resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.file_name}{resume.is_default ? ' (default)' : ''}
                </option>
              )) : <option value="">No resume uploaded yet</option>}
            </select>
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Cover letter</span>
            <textarea {...register('coverLetter')} rows="6" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Optional cover letter" />
          </label>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-950">
              Cancel
            </button>
            <button type="submit" disabled={loading || !resumes.length} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { ApplyModal };