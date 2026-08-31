'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ProtectedRoute } from '../../../../../components/layout/ProtectedRoute';
import { JobPostForm } from '../../../../../components/forms/JobPostForm';
import { useProvider } from '../../../../../hooks/useProvider';

function EditProviderJobPage() {
  const params = useParams();
  const router = useRouter();
  const { job, fetchJob, updateJob, error, loading } = useProvider();

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

          {error && (
            <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-red-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <strong>Error:</strong> {error}
                {error.toLowerCase().includes('token') || error.toLowerCase().includes('auth') ? (
                  <p className="mt-1 text-xs text-red-600">Your session credentials may have expired. Please sign in again to refresh your session.</p>
                ) : null}
              </div>
              {(error.toLowerCase().includes('token') || error.toLowerCase().includes('auth')) && (
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="shrink-0 rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 transition"
                >
                  Sign In Again
                </button>
              )}
            </div>
          )}

          {loading && !job && (
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 text-slate-700">
              Loading job details...
            </div>
          )}

          {job && <JobPostForm initialValues={job} onSubmit={onSubmit} buttonLabel="Save changes" />}
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default EditProviderJobPage;