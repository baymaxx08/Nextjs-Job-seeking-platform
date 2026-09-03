'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { StatusBadge } from './StatusBadge';

function ResumeViewerModal({
  open,
  onClose,
  candidate,
  onUpdateStatus,
}) {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileSizeStr, setFileSizeStr] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fileName = candidate?.resume_file_name || 'Resume.pdf';
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  const isPdf = ext === '.pdf' || !ext;

  useEffect(() => {
    let currentUrl = '';

    if (open && candidate?.id) {
      setLoading(true);
      setError('');
      setBlobUrl('');

      api
        .get(`/provider/applications/${candidate.id}/resume?inline=true`, {
          responseType: 'blob',
        })
        .then((response) => {
          const contentType = response.headers['content-type'] || (isPdf ? 'application/pdf' : 'application/octet-stream');
          const blob = new Blob([response.data], { type: contentType });
          currentUrl = window.URL.createObjectURL(blob);
          setBlobUrl(currentUrl);
          setFileSizeStr(`${Math.round(blob.size / 1024)} KB`);
        })
        .catch((err) => {
          console.error('Error loading resume for preview:', err);
          setError(err?.response?.data?.message || 'Unable to preview resume document.');
        })
        .finally(() => {
          setLoading(false);
        });
    }

    return () => {
      if (currentUrl) {
        window.URL.revokeObjectURL(currentUrl);
      }
    };
  }, [open, candidate?.id, isPdf]);

  if (!open || !candidate) {
    return null;
  }

  const handleDownload = () => {
    if (blobUrl) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Direct API download
      window.open(`/api/provider/applications/${candidate.id}/resume`, '_blank');
    }
  };

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`/api/provider/applications/${candidate.id}/resume?inline=true`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!onUpdateStatus) return;
    setUpdatingStatus(true);
    try {
      await onUpdateStatus(candidate.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div
      id="resume-viewer-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="resume-viewer-card"
        className="w-full max-w-5xl rounded-3xl bg-white shadow-[0_25px_70px_rgba(15,23,42,0.3)] border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh]"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-8 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {(candidate.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-950">{candidate.full_name}</h3>
                <StatusBadge status={candidate.status} />
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                {candidate.headline || candidate.seeker_email} · Document: <span className="font-semibold text-slate-700">{fileName}</span>
                {fileSizeStr ? ` (${fileSizeStr})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="resume-modal-open-tab-btn"
              type="button"
              onClick={handleOpenInNewTab}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
              title="Open document in a separate browser tab"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Open in New Tab</span>
            </button>

            <button
              id="resume-modal-download-btn"
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 text-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
              title="Download local copy"
            >
              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download</span>
            </button>

            <button
              id="resume-modal-close-btn"
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              aria-label="Close viewer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 min-h-[420px] max-h-[72vh] overflow-y-auto bg-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-10 h-10 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Loading document preview...</p>
              <p className="text-xs text-slate-400">Fetching {fileName} from secure storage</p>
            </div>
          ) : error ? (
            <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-rose-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900">Preview Notice</h4>
              <p className="text-xs text-slate-600">{error}</p>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 text-white px-4 py-2 text-xs font-semibold hover:bg-slate-800 transition"
              >
                Download File Directly
              </button>
            </div>
          ) : isPdf && blobUrl ? (
            <div className="w-full h-full flex flex-col">
              <object
                data={blobUrl}
                type="application/pdf"
                className="w-full h-[66vh] rounded-2xl border border-slate-300 bg-white shadow-inner"
              >
                {/* Fallback iframe */}
                <iframe
                  src={blobUrl}
                  title="Candidate Resume Preview"
                  className="w-full h-[66vh] rounded-2xl border border-slate-300 bg-white shadow-inner"
                >
                  <p className="p-4 text-center text-sm text-slate-600">
                    Your browser does not support embedded PDF viewing.{' '}
                    <a href={blobUrl} download={fileName} className="font-bold text-slate-950 underline">
                      Click here to download the file
                    </a>
                  </p>
                </iframe>
              </object>
            </div>
          ) : (
            /* Word doc, text or other document type */
            <div className="max-w-lg w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-slate-950 text-lg">{fileName}</h4>
                <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">
                  Document Type: {ext.replace('.', '').toUpperCase()} · {fileSizeStr || 'Ready'}
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                This document is formatted as a {ext.toUpperCase()} file. You can open it in a separate tab or download a copy directly to view with your local reader.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  Download {ext.toUpperCase()} File
                </button>
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Candidate Decision Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-8 border-t border-slate-100 bg-white">
          <div className="text-xs text-slate-500 font-medium">
            Reviewing candidate for: <span className="font-semibold text-slate-800">{candidate.title || 'Position'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => handleStatusChange('shortlisted')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition border ${
                candidate.status === 'shortlisted'
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              Shortlist
            </button>
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => handleStatusChange('interview')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition border ${
                candidate.status === 'interview'
                  ? 'bg-indigo-600 text-white border-indigo-700'
                  : 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              Schedule Interview
            </button>
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => handleStatusChange('on_hold')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition border ${
                candidate.status === 'on_hold'
                  ? 'bg-purple-600 text-white border-purple-700'
                  : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
              }`}
            >
              On Hold
            </button>
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => handleStatusChange('hired')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition border ${
                candidate.status === 'hired'
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-sm'
              }`}
            >
              Approve / Hire
            </button>
            <button
              type="button"
              disabled={updatingStatus}
              onClick={() => handleStatusChange('rejected')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition border ${
                candidate.status === 'rejected'
                  ? 'bg-rose-600 text-white border-rose-700'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ResumeViewerModal };
