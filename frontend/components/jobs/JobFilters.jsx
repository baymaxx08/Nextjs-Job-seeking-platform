'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      type: searchParams.get('type') || '',
      experience: searchParams.get('experience') || '',
      salary_min: searchParams.get('salary_min') || '',
      is_remote: searchParams.get('is_remote') || '',
      posted: searchParams.get('posted') || '',
    },
  });

  useEffect(() => {
    reset({
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || '',
      type: searchParams.get('type') || '',
      experience: searchParams.get('experience') || '',
      salary_min: searchParams.get('salary_min') || '',
      is_remote: searchParams.get('is_remote') || '',
      posted: searchParams.get('posted') || '',
    });
  }, [searchParams, reset]);

  const onSubmit = (values) => {
    const params = new URLSearchParams();

    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <input {...register('search')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900" placeholder="Search jobs or companies" />
        <input {...register('location')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900" placeholder="Location" />
        <select {...register('type')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900">
          <option value="">Job type</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
        <select {...register('experience')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900">
          <option value="">Experience</option>
          <option value="entry">Entry</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
        </select>
        <select {...register('is_remote')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900">
          <option value="">Remote / onsite</option>
          <option value="true">Remote only</option>
          <option value="false">Onsite only</option>
        </select>
        <select {...register('posted')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900">
          <option value="">Date posted</option>
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
        <input {...register('salary_min')} type="number" min="0" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900 xl:col-span-2" placeholder="Minimum salary" />
        <div className="flex items-end xl:col-span-1">
          <button type="submit" className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Filter
          </button>
        </div>
      </div>
    </form>
  );
}

export { JobFilters };