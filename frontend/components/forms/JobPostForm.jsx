'use client';

import { useForm } from 'react-hook-form';

function JobPostForm({ initialValues, onSubmit, buttonLabel = 'Save job' }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      requirements: initialValues?.requirements || '',
      responsibilities: initialValues?.responsibilities || '',
      location: initialValues?.location || '',
      isRemote: initialValues?.is_remote !== undefined ? (initialValues.is_remote ? 'true' : 'false') : 'true',
      jobType: initialValues?.job_type || initialValues?.jobType || 'full-time',
      salaryMin: initialValues?.salary_min ?? initialValues?.salaryMin ?? '',
      salaryMax: initialValues?.salary_max ?? initialValues?.salaryMax ?? '',
      currency: initialValues?.currency || 'USD',
      experienceLevel: initialValues?.experience_level || initialValues?.experienceLevel || 'mid',
      status: initialValues?.status || 'open',
      applicationDeadline: initialValues?.application_deadline ? String(initialValues.application_deadline).slice(0, 10) : '',
      skills: Array.isArray(initialValues?.skills)
        ? initialValues.skills.join(', ')
        : initialValues?.skills || '',
    },
  });

  const submit = (values) => {
    const payload = {
      title: values.title?.trim(),
      description: values.description?.trim(),
      requirements: values.requirements?.trim(),
      responsibilities: values.responsibilities?.trim() || null,
      location: values.location?.trim() || null,
      isRemote: values.isRemote === 'true' || values.isRemote === true,
      jobType: values.jobType || 'full-time',
      salaryMin: values.salaryMin !== '' && values.salaryMin !== null && values.salaryMin !== undefined ? Number(values.salaryMin) : null,
      salaryMax: values.salaryMax !== '' && values.salaryMax !== null && values.salaryMax !== undefined ? Number(values.salaryMax) : null,
      currency: values.currency?.trim() || 'USD',
      experienceLevel: values.experienceLevel || 'mid',
      status: values.status || 'open',
      applicationDeadline: values.applicationDeadline?.trim() ? values.applicationDeadline.trim() : null,
      skills: values.skills
        ? (Array.isArray(values.skills)
            ? values.skills
            : values.skills.split(',').map((skill) => skill.trim()).filter(Boolean))
        : [],
    };

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-800">
            Job Title <span className="text-rose-500">*</span>
          </label>
          <input
            {...register('title', {
              required: 'Job title is required',
              minLength: { value: 2, message: 'Title must be at least 2 characters' },
            })}
            className={`mt-2 w-full rounded-2xl border ${
              errors.title ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'
            } px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white`}
            placeholder="e.g. Senior Full Stack Engineer"
          />
          {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-800">
            Job Description <span className="text-rose-500">*</span>
            <span className="ml-1 text-xs font-normal text-slate-500">(minimum 10 characters)</span>
          </label>
          <textarea
            {...register('description', {
              required: 'Job description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters long' },
            })}
            rows="5"
            className={`mt-2 w-full rounded-2xl border ${
              errors.description ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'
            } px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white`}
            placeholder="Describe the role overview, mission, tech stack, and company culture..."
          />
          {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
        </div>

        {/* Requirements */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-800">
            Job Requirements <span className="text-rose-500">*</span>
            <span className="ml-1 text-xs font-normal text-slate-500">(minimum 10 characters)</span>
          </label>
          <textarea
            {...register('requirements', {
              required: 'Requirements are required',
              minLength: { value: 10, message: 'Requirements must be at least 10 characters long' },
            })}
            rows="4"
            className={`mt-2 w-full rounded-2xl border ${
              errors.requirements ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-slate-50'
            } px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white`}
            placeholder="List required skills, years of experience, educational or background requirements..."
          />
          {errors.requirements && <p className="mt-1 text-xs text-rose-600">{errors.requirements.message}</p>}
        </div>

        {/* Responsibilities */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-800">
            Key Responsibilities <span className="text-xs font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            {...register('responsibilities')}
            rows="3"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
            placeholder="Key day-to-day duties, deliverables, and team leadership expectations..."
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-slate-800">Location / City</label>
          <input
            {...register('location')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
            placeholder="e.g. San Francisco, CA or Remote"
          />
        </div>

        {/* Remote vs Onsite */}
        <div>
          <label className="block text-sm font-semibold text-slate-800">Workplace Type</label>
          <select
            {...register('isRemote')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
          >
            <option value="true">Remote Friendly</option>
            <option value="false">On-site / In-office</option>
          </select>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-800">Employment Type</label>
          <select
            {...register('jobType')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract / Freelance</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-semibold text-slate-800">Experience Level</label>
          <select
            {...register('experienceLevel')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
          >
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
          </select>
        </div>

        {/* Salary Min */}
        <div>
          <label className="block text-sm font-semibold text-slate-800">Minimum Annual Salary</label>
          <input
            type="number"
            min="0"
            step="1000"
            {...register('salaryMin')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
            placeholder="e.g. 80000"
          />
        </div>

        {/* Salary Max */}
        <div>
          <label className="block text-sm font-semibold text-slate-800">Maximum Annual Salary</label>
          <input
            type="number"
            min="0"
            step="1000"
            {...register('salaryMax')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
            placeholder="e.g. 120000"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-semibold text-slate-800">Currency</label>
          <input
            {...register('currency')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
            placeholder="USD"
          />
        </div>

        {/* Application Deadline */}
        <div>
          <label className="block text-sm font-semibold text-slate-800">Application Deadline</label>
          <input
            type="date"
            {...register('applicationDeadline')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
          />
        </div>

        {/* Job Status */}
        <div>
          <label className="block text-sm font-semibold text-slate-800">Listing Status</label>
          <select
            {...register('status')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
          >
            <option value="open">Open (Accepting applications)</option>
            <option value="closed">Closed</option>
            <option value="filled">Filled</option>
          </select>
        </div>

        {/* Required Skills */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-800">
            Required Skills <span className="text-xs font-normal text-slate-500">(comma separated)</span>
          </label>
          <input
            {...register('skills')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-900 focus:bg-white"
            placeholder="e.g. React, Next.js, TypeScript, Tailwind CSS, REST APIs"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : buttonLabel}
        </button>
      </div>
    </form>
  );
}

export { JobPostForm };
