'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { ProtectedRoute } from '../../../../../components/layout/ProtectedRoute';
import { ApplicantTable } from '../../../../../components/applications/ApplicantTable';
import { useProvider } from '../../../../../hooks/useProvider';

function ProviderJobApplicationsPage() {
  const params = useParams();
  const { applications, fetchJobApplications, updateApplicationStatus, downloadApplicationResume } = useProvider();

  useEffect(() => {
    if (params?.id) {
      fetchJobApplications(params.id);
    }
  }, [params?.id, fetchJobApplications]);

  const handleDownloadResume = async (applicationId) => {
    const blob = await downloadApplicationResume(applicationId);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <ProtectedRoute allowedRole="provider">
      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 lg:px-8">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Applicants</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">Review candidates</h1>
          </div>

          <ApplicantTable applications={applications} onUpdateStatus={updateApplicationStatus} onDownloadResume={handleDownloadResume} />
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default ProviderJobApplicationsPage;