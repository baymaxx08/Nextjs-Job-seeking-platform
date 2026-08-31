'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { registerProviderSchema, registerSeekerSchema } from '../../lib/validators';
import { useAuth } from '../../hooks/useAuth';

function RegisterForm({ role }) {
  const router = useRouter();
  const { register: registerAccount } = useAuth();
  const schema = role === 'provider' ? registerProviderSchema : registerSeekerSchema;
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
      headline: '',
      location: '',
      industry: '',
    },
  });

  const onSubmit = async (values) => {
    setSubmitError('');

    const payload = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== '' && value !== undefined)
    );

    try {
      const response = await registerAccount(role, payload);
      const dashboardPath = response?.user?.role === 'provider' ? '/provider/dashboard' : '/seeker/dashboard';
      router.push(dashboardPath);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to create your account');
    }
  };

  const isProvider = role === 'provider';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Create account</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Register as {isProvider ? 'a provider' : 'a seeker'}</h1>
        <p className="text-sm text-slate-600">Set up your profile and get started in minutes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          <span>{isProvider ? 'Company name' : 'Full name'}</span>
          <input {...register(isProvider ? 'companyName' : 'fullName')} type="text" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900" placeholder={isProvider ? 'Acme Technologies' : 'Jane Doe'} />
          {isProvider ? errors.companyName ? <span className="text-xs text-rose-600">{errors.companyName.message}</span> : null : errors.fullName ? <span className="text-xs text-rose-600">{errors.fullName.message}</span> : null}
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          <span>Email</span>
          <input type="email" {...register('email')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900" placeholder="you@example.com" />
          {errors.email ? <span className="text-xs text-rose-600">{errors.email.message}</span> : null}
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Password</span>
          <input type="password" {...register('password')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900" placeholder="Create a password" />
          {errors.password ? <span className="text-xs text-rose-600">{errors.password.message}</span> : null}
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Confirm password</span>
          <input type="password" {...register('confirmPassword')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900" placeholder="Repeat your password" />
          {errors.confirmPassword ? <span className="text-xs text-rose-600">{errors.confirmPassword.message}</span> : null}
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          <span>{isProvider ? 'Industry' : 'Headline'}</span>
          <input type="text" {...register(isProvider ? 'industry' : 'headline')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900" placeholder={isProvider ? 'Technology' : 'UI engineer building accessible products'} />
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
          <span>Location</span>
          <input type="text" {...register('location')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900" placeholder="Remote or city name" />
        </label>
      </div>

      {submitError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

      <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Already have an account?</span>
        <a href="/login" className="font-semibold text-slate-950 underline-offset-4 hover:underline">
          Sign in
        </a>
      </div>
    </form>
  );
}

export { RegisterForm };