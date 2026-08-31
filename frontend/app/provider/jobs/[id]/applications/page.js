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

  const handleDownloadResume = async (applicationId, fileName) => {
    try {
      const blob = await downloadApplicationResume(applicationId);
      if (!blob) return;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'candidate-resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download resume:', err);
    }
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