'use client';

import { useRouter } from 'next/navigation';

import { ProtectedRoute } from '../../../../components/layout/ProtectedRoute';
import { JobPostForm } from '../../../../components/forms/JobPostForm';
import { useProvider } from '../../../../hooks/useProvider';

function NewProviderJobPage() {
  const router = useRouter();
  const { createJob, error, loading } = useProvider();

  const onSubmit = async (values) => {
    console.log('NewProviderJobPage.onSubmit called with values:', values);
    try {
      const result = await createJob(values);
      console.log('Create job result:', result, 'Error:', error);
      if (result?.job_id) {
        console.log('Job created successfully with ID:', result.job_id);
        router.push('/provider/jobs');
      } else {
        console.error('createJob returned:', result, 'with error:', error);
      }
    } catch (err) {
      console.error('Unexpected error in onSubmit:', err);
    }
  };

  return (
    <ProtectedRoute allowedRole="provider">
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">New job</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">Create a job posting</h1>
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

          {loading && (
            <div className="rounded-[2rem] border border-blue-200 bg-blue-50 p-4 text-blue-700">
              Creating job...
            </div>
          )}

          <JobPostForm onSubmit={onSubmit} buttonLabel="Publish job" />
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default NewProviderJobPage;