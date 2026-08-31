'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { useSeeker } from '../../../hooks/useSeeker';

function SeekerResumePage() {
  const { resumes, fetchProfile, uploadResume, deleteResume } = useSeeker();
  const [selectedFile, setSelectedFile] = useState(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { isDefault: true },
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (values) => {
    if (!selectedFile) {
      return;
    }

    await uploadResume(selectedFile, values.isDefault);
    setSelectedFile(null);
    reset({ isDefault: true });
    await fetchProfile();
  };

  return (
    <ProtectedRoute allowedRole="seeker">
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 lg:px-8">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Resumes</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">Upload and manage resumes</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <input type="file" accept="application/pdf" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" {...register('isDefault')} />
              Set as default resume
            </label>
            <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Upload resume
            </button>
          </form>

          <div className="grid gap-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-950">{resume.file_name}</p>
                  <p className="text-sm text-slate-600">{Math.round(resume.file_size / 1024)} KB {resume.is_default ? '· Default' : ''}</p>
                </div>
                <button type="button" onClick={() => deleteResume(resume.id)} className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default SeekerResumePage;