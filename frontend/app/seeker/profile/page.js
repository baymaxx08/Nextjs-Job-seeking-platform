'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { useSeeker } from '../../../hooks/useSeeker';

function SeekerProfilePage() {
  const { skills, fetchProfile, updateProfile } = useSeeker();

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      fullName: '',
      headline: '',
      bio: '',
      location: '',
      phone: '',
      linkedinUrl: '',
      portfolioUrl: '',
      yearsOfExperience: '',
      availability: 'immediate',
      skills: '',
    },
  });

  useEffect(() => {
    fetchProfile().then((payload) => {
      if (!payload) {
        return;
      }

      reset({
        fullName: payload.profile?.full_name || '',
        headline: payload.profile?.headline || '',
        bio: payload.profile?.bio || '',
        location: payload.profile?.location || '',
        phone: payload.profile?.phone || '',
        linkedinUrl: payload.profile?.linkedin_url || '',
        portfolioUrl: payload.profile?.portfolio_url || '',
        yearsOfExperience: payload.profile?.years_of_experience ?? '',
        availability: payload.profile?.availability || 'immediate',
        skills: (payload.skills || []).join(', '),
      });
    });
  }, [fetchProfile, reset]);

  const onSubmit = async (values) => {
    await updateProfile(values);
    await fetchProfile();
  };

  return (
    <ProtectedRoute allowedRole="seeker">
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Profile</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">Edit your seeker profile</h1>
          <p className="mt-2 text-sm text-slate-600">Keep your public profile and skills current for better matching.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4 md:grid-cols-2">
            <input {...register('fullName')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900 md:col-span-2" placeholder="Full name" />
            <input {...register('headline')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900 md:col-span-2" placeholder="Headline" />
            <textarea {...register('bio')} rows="5" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900 md:col-span-2" placeholder="Bio" />
            <input {...register('location')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Location" />
            <input {...register('phone')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Phone" />
            <input {...register('linkedinUrl')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="LinkedIn URL" />
            <input {...register('portfolioUrl')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Portfolio URL" />
            <input type="number" min="0" {...register('yearsOfExperience')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Years of experience" />
            <select {...register('availability')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900">
              <option value="immediate">Immediate</option>
              <option value="2weeks">2 weeks</option>
              <option value="1month">1 month</option>
            </select>
            <input {...register('skills')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900 md:col-span-2" placeholder="Skills separated by commas" />

            <div className="md:col-span-2">
              <button type="submit" disabled={isSubmitting} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                {isSubmitting ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default SeekerProfilePage;