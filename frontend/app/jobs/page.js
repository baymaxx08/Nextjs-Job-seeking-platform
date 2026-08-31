import { Suspense } from 'react';
import { JobsContent } from '../../components/jobs/JobsContent';

export const dynamic = 'force-dynamic';

export default function JobsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 lg:px-8">
      <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading jobs...</div>}>
        <JobsContent />
      </Suspense>
    </main>
  );
}
