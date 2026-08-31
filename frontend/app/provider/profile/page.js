'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ProtectedRoute } from '../../../components/layout/ProtectedRoute';
import { useProvider } from '../../../hooks/useProvider';

function ProviderProfilePage() {
  const { fetchProfile, updateProfile } = useProvider();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      companyName: '',
      industry: '',
      companySize: '',
      description: '',
      website: '',
      location: '',
      logoUrl: '',
      foundedYear: '',
    },
  });

  useEffect(() => {
    fetchProfile().then((loadedProfile) => {
      if (!loadedProfile) {
        return;
      }

      reset({
        companyName: loadedProfile.company_name || '',
        industry: loadedProfile.industry || '',
        companySize: loadedProfile.company_size || '',
        description: loadedProfile.description || '',
        website: loadedProfile.website || '',
        location: loadedProfile.location || '',
        logoUrl: loadedProfile.logo_url || '',
        foundedYear: loadedProfile.founded_year || '',
      });
    });
  }, [fetchProfile, reset]);

  const onSubmit = async (values) => {
    await updateProfile(values);
    await fetchProfile();
  };

  return (
    <ProtectedRoute allowedRole="provider">
      <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Company profile</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-slate-950">Manage your company details</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4 md:grid-cols-2">
            <input {...register('companyName')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900 md:col-span-2" placeholder="Company name" />
            <input {...register('industry')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Industry" />
            <input {...register('companySize')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Company size" />
            <textarea {...register('description')} rows="5" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900 md:col-span-2" placeholder="Description" />
            <input {...register('website')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Website" />
            <input {...register('location')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Location" />
            <input {...register('logoUrl')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Logo URL" />
            <input type="number" min="1800" {...register('foundedYear')} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-slate-900" placeholder="Founded year" />
            <div className="md:col-span-2">
              <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Save company profile
              </button>
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}

export default ProviderProfilePage;