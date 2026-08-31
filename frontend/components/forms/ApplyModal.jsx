'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';

function ApplyModal({ open, job, resumes = [], loading, onClose, onSubmit, onUploadResume }) {
  const [activeTab, setActiveTab] = useState(resumes.length ? 'existing' : 'upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const defaultResumeId = resumes.find((r) => r.is_default)?.id || resumes[0]?.id || '';

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      resumeId: defaultResumeId,
      coverLetter: '',
    },
  });

  const watchResumeId = watch('resumeId');

  useEffect(() => {
    if (open) {
      const initResumeId = resumes.find((r) => r.is_default)?.id || resumes[0]?.id || '';
      reset({
        resumeId: initResumeId,
        coverLetter: '',
      });
      setSelectedFile(null);
      setUploadError('');
      setIsSubmitting(false);
      setActiveTab(resumes.length > 0 ? 'existing' : 'upload');
    }
  }, [open, resumes, reset]);

  if (!open) {
    return null;
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be under 5MB');
      setSelectedFile(null);
      return;
    }

    const validTypes = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const isValid = validTypes.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setUploadError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      setSelectedFile(null);
      return;
    }

    setUploadError('');
    setSelectedFile(file);
  };

  const handleFormSubmit = async (data) => {
    setUploadError('');
    setIsSubmitting(true);

    try {
      let finalResumeId = data.resumeId;

      if (activeTab === 'upload') {
        if (!selectedFile) {
          setUploadError('Please select a resume file to upload');
          setIsSubmitting(false);
          return;
        }

        if (onUploadResume) {
          const uploaded = await onUploadResume(selectedFile, false);
          if (!uploaded?.id) {
            setUploadError('Failed to upload resume. Please try again.');
            setIsSubmitting(false);
            return;
          }
          finalResumeId = uploaded.id;
        }
      } else {
        if (!finalResumeId) {
          setUploadError('Please select a resume from your list');
          setIsSubmitting(false);
          return;
        }
      }

      await onSubmit({
        resumeId: finalResumeId,
        coverLetter: data.coverLetter,
      });
    } catch (err) {
      setUploadError(err.message || 'Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="apply-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div id="apply-modal-card" className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-[0_25px_70px_rgba(15,23,42,0.25)] border border-slate-100 my-8">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700">
              Application
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{job?.title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{job?.company?.name || job?.company_name}</p>
          </div>
          <button
            id="apply-modal-close-btn"
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6 space-y-5">
          {/* Resume Option Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Resume Attachment *</label>
            
            {resumes.length > 0 ? (
              <div className="flex rounded-xl bg-slate-100 p-1 mb-3">
                <button
                  id="tab-existing-resume-btn"
                  type="button"
                  onClick={() => {
                    setActiveTab('existing');
                    setUploadError('');
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                    activeTab === 'existing'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Select Saved Resume ({resumes.length})
                </button>
                <button
                  id="tab-upload-new-resume-btn"
                  type="button"
                  onClick={() => {
                    setActiveTab('upload');
                    setUploadError('');
                  }}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                    activeTab === 'upload'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload New Resume
                </button>
              </div>
            ) : null}

            {activeTab === 'existing' && resumes.length > 0 ? (
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <label
                    key={resume.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      String(watchResumeId) === String(resume.id)
                        ? 'border-slate-950 bg-slate-50 ring-1 ring-slate-950'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        value={resume.id}
                        {...register('resumeId')}
                        checked={String(watchResumeId) === String(resume.id)}
                        className="text-slate-950 focus:ring-slate-950 h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{resume.file_name}</p>
                        <p className="text-xs text-slate-500">
                          Uploaded {new Date(resume.uploaded_at || Date.now()).toLocaleDateString()}
                          {resume.file_size ? ` · ${(resume.file_size / 1024).toFixed(0)} KB` : ''}
                        </p>
                      </div>
                    </div>
                    {resume.is_default && (
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        Default
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                    selectedFile
                      ? 'border-emerald-500 bg-emerald-50/40'
                      : 'border-slate-200 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(0)} KB · Ready to attach</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="mt-2 text-xs font-medium text-rose-600 hover:underline"
                      >
                        Change file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">Click to upload resume for this job</p>
                      <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <label className="block space-y-1.5 text-sm font-semibold text-slate-900">
            <span>Cover Letter <span className="text-slate-400 font-normal">(Optional)</span></span>
            <textarea
              id="apply-cover-letter-input"
              {...register('coverLetter')}
              rows="4"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-950 outline-none focus:border-slate-900 focus:bg-white transition"
              placeholder="Introduce yourself and explain why you're a great fit for this position..."
            />
          </label>

          {/* Error Message */}
          {uploadError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{uploadError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              id="apply-modal-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting || loading}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              id="apply-modal-submit-btn"
              type="submit"
              disabled={isSubmitting || loading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'existing' && !watchResumeId)}
              className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isSubmitting || loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { ApplyModal };