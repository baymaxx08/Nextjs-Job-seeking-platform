'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ProtectedRoute } from '../../../../../components/layout/ProtectedRoute';
import { JobPostForm } from '../../../../../components/forms/JobPostForm';
import { useProvider } from '../../../../../hooks/useProvider';

function EditProviderJobPage() {
  const params = useParams();
  const router = useRouter();
  const { job, fetchJob, updateJob } = useProvider();

  useEffect(() => {
    if (params?.id) {
      fetchJob(params.id);
    }
  }, [params?.id, fetchJob]);

  const onSubmit = async (values) => {
    const result = await updateJob(params.id, values);
    if (result !== null) {
      router.push('/provider/jobs');
    }
  };

  return (
    <ProtectedRoute allowedRole="provider">
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Edit job</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">Update posting</h1>
          </div>

          <JobPostForm initialValues={job} onSubmit={onSubmit} buttonLabel="Save changes" />
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default EditProviderJobPage;