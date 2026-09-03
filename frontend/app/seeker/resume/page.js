'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { useSeeker } from '../../../hooks/useSeeker';

function SeekerResumePage() {
  const {
    resumes,
    fetchProfile,
    uploadResume,
    downloadResume,
    getResumeBlobUrl,
    deleteResume,
  } = useSeeker();

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewResume, setPreviewResume] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fileInputRef = useRef(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { isDefault: true },
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setActionError('File size exceeds the 5MB limit.');
      setSelectedFile(null);
      return;
    }

    const validExtensions = ['.pdf', '.doc', '.docx', '.rtf', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setActionError('Supported file types: PDF, Word (.doc, .docx), RTF, and text files (.txt).');
      setSelectedFile(null);
      return;
    }

    setActionError('');
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const onSubmit = async (values) => {
    if (!selectedFile) {
      setActionError('Please select a resume file from your device first.');
      return;
    }

    setUploading(true);
    setActionError('');
    setSuccessMessage('');

    try {
      const result = await uploadResume(selectedFile, values.isDefault);
      if (result) {
        setSuccessMessage(`Resume "${selectedFile.name}" uploaded successfully!`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        reset({ isDefault: true });
        await fetchProfile();
      } else {
        setActionError('Failed to upload resume. Please verify the file and try again.');
      }
    } catch (err) {
      setActionError(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenPreview = async (resume) => {
    setPreviewResume(resume);
    setLoadingPreview(true);
    try {
      const url = await getResumeBlobUrl(resume.id);
      setPreviewBlobUrl(url || '');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewResume(null);
    setPreviewBlobUrl('');
  };

  return (
    <ProtectedRoute allowedRole="seeker">
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 lg:px-8">
        <div className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-10 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          {/* Header */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Document Management</span>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950">
              Upload and Manage Resumes
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Upload your resume from your computer or phone. Your attached document will be instantly viewable and downloadable by hiring providers when you apply for positions.
            </p>
          </div>

          {/* Feedback Banners */}
          {actionError && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 animate-fade-in">
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{actionError}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 animate-fade-in">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Upload Card */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8"
          >
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">Upload Resume from Local Device</label>
              <p className="text-xs text-slate-500 mb-3">Accepted formats: PDF (.pdf), Microsoft Word (.doc, .docx), RTF, or Plain Text (.txt) up to 5MB.</p>

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-slate-900 bg-slate-100'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-300 bg-white hover:border-slate-500 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  id="resume-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.rtf,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={onFileInputChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-950">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(0)} KB · Ready to upload</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-xs font-semibold text-rose-600 hover:underline inline-block mt-1"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        <span className="text-slate-950 underline underline-offset-2">Click to browse</span> or drag and drop your file here
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Select from computer, phone or tablet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isDefault')}
                  className="rounded text-slate-950 focus:ring-slate-950 h-4 w-4"
                />
                <span>Set as my primary default resume for one-click applications</span>
              </label>

              <button
                id="submit-upload-resume-btn"
                type="submit"
                disabled={!selectedFile || uploading}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 shadow-sm"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading file...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Upload Resume</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Existing Resumes List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950">Your Uploaded Resumes ({resumes.length})</h2>

            {resumes.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-medium text-slate-600">You have not uploaded any resumes yet.</p>
                <p className="text-xs text-slate-400 mt-1">Upload a resume above to start applying for open jobs.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-rose-500 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-950 text-sm sm:text-base">{resume.file_name}</p>
                          {resume.is_default && (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                              Primary Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {Math.round((resume.file_size || 0) / 1024)} KB · Uploaded {new Date(resume.uploaded_at || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(resume)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-2 text-xs font-semibold text-indigo-950 hover:bg-indigo-100 transition shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Document</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadResume(resume.id, resume.file_name)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`Delete resume "${resume.file_name}"?`)) {
                            await deleteResume(resume.id);
                          }
                        }}
                        className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Preview Modal for Seeker */}
      {previewResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClosePreview();
          }}
        >
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-base">{previewResume.file_name}</h3>
                  <p className="text-xs text-slate-500">Document preview</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadResume(previewResume.id, previewResume.file_name)}
                  className="rounded-xl bg-slate-950 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Download File
                </button>
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-200 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-100 flex-1 min-h-[400px] flex items-center justify-center">
              {loadingPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-600">Loading document...</p>
                </div>
              ) : previewBlobUrl ? (
                <object
                  data={previewBlobUrl}
                  type="application/pdf"
                  className="w-full h-[65vh] rounded-2xl border border-slate-300 bg-white"
                >
                  <iframe
                    src={previewBlobUrl}
                    title="Resume Preview"
                    className="w-full h-[65vh] rounded-2xl border border-slate-300 bg-white"
                  />
                </object>
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Preview not directly available in frame.</p>
                  <button
                    type="button"
                    onClick={() => downloadResume(previewResume.id, previewResume.file_name)}
                    className="mt-3 rounded-xl bg-slate-950 text-white px-4 py-2 text-xs font-semibold"
                  >
                    Download to view
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

export default SeekerResumePage;
