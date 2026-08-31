'use client';

import { useForm } from 'react-hook-form';

function JobPostForm({ initialValues, onSubmit, buttonLabel = 'Save job' }) {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({
    mode: 'onBlur',
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      requirements: initialValues?.requirements || '',
      responsibilities: initialValues?.responsibilities || '',
      location: initialValues?.location || '',
      isRemote: initialValues?.is_remote ? 'true' : 'false',
      jobType: initialValues?.job_type || 'full-time',
      salaryMin: initialValues?.salary_min || '',
      salaryMax: initialValues?.salary_max || '',
      currency: initialValues?.currency || 'USD',
      experienceLevel: initialValues?.experience_level || 'mid',
      status: initialValues?.status || 'open',
      applicationDeadline: initialValues?.application_deadline || '',
      skills: Array.isArray(initialValues?.skills) ? initialValues.skills.join(', ') : '',
    },
  });

  const submit = (values) => {
    console.log('JobPostForm submit called with:', values);
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== '' && value !== undefined)
    );

    payload.skills = payload.skills ? payload.skills.split(',').map((skill) => skill.trim()).filter(Boolean) : [];

    console.log('Payload being sent:', payload);
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <input {...register('title', { required: 'Title is required', minLength: { value: 2, message: 'Min 2 chars' } })} className={`w-full rounded-2xl border ${errors.title ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} px-4 py-3 text-slate-950 outline-none focus:border-slate-900`} placeholder="Job title *" />
          {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
        </div>
        
        <div className="md:col-span-2">
          <textarea {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Min 10 chars' } })} rows="5" className={`w-full rounded-2xl border ${errors.description ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} px-4 py-3 text-slate-950 outline-none focus:border-slate-900`} placeholder="Job description *" />
          {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
        </div>
        
        <div className="md:col-span-2">
          <textarea {...register('requirements', { required: 'Requirements are required', minLength: { value: 10, message: 'Min 10 chars' } })} rows="4" className={`w-full rounded-2xl border ${errors.requirements ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} px-4 py-3 text-slate-950 outline-none focus:border-slate-900`} placeholder="Requirements *" />
          {errors.requirements && <p className="text-red-600 text-xs mt-1">{errors.requirements.message}</p>}
        </div>
        
        <textarea {...register('responsibilities')} rows="4" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900 md:col-span-2" placeholder="Responsibilities" />
        <input {...register('location')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Location" />
        <select {...register('isRemote')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900">
          <option value="true">Remote</option>
          <option value="false">Onsite</option>
        </select>
        <select {...register('jobType')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900">
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
        <select {...register('experienceLevel')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900">
          <option value="entry">Entry</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
        <input type="number" min="0" {...register('salaryMin')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Minimum salary" />
        <input type="number" min="0" {...register('salaryMax')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Maximum salary" />
        <input {...register('currency')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Currency" />
        <input type="date" {...register('applicationDeadline')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" />
        <select {...register('status')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900">
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="filled">Filled</option>
        </select>
        <input {...register('skills')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900 md:col-span-2" placeholder="Required skills separated by commas" />
      </div>

      <button type="submit" disabled={isSubmitting} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
        {isSubmitting ? 'Saving...' : buttonLabel}
      </button>
    </form>
  );
}

export { JobPostForm };