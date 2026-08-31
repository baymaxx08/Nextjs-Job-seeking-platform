'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema } from '../../lib/validators';
import { useAuth } from '../../hooks/useAuth';

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('seeker');
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'seeker',
      email: '',
      password: '',
    },
  });

  const selectRole = (role) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
    setSubmitError('');
  };

  const fillDemo = (role) => {
    selectRole(role);
    if (role === 'provider') {
      setValue('email', 'provider@techcorp.io', { shouldValidate: true });
      setValue('password', 'Password123!', { shouldValidate: true });
    } else {
      setValue('email', 'alex.rivera@example.com', { shouldValidate: true });
      setValue('password', 'Password123!', { shouldValidate: true });
    }
  };

  const onSubmit = async (values) => {
    setSubmitError('');

    try {
      const payload = await login(values);
      const dashboardPath = payload?.user?.role === 'provider' ? '/provider/dashboard' : '/seeker/dashboard';
      router.push(dashboardPath);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to sign in. Please verify your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Welcome back</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Sign in to your account</h1>
        <p className="text-sm text-slate-600">Choose the role that matches how you use the platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-1">
        <button type="button" onClick={() => selectRole('seeker')} className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${selectedRole === 'seeker' ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-600 hover:text-slate-950'}`}>
          Job Seeker
        </button>
        <button type="button" onClick={() => selectRole('provider')} className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${selectedRole === 'provider' ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-600 hover:text-slate-950'}`}>
          Job Provider
        </button>
      </div>

      {/* Demo credentials helper banner */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-900">
        <div className="flex items-center justify-between font-semibold">
          <span>Quick Demo Access:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo('provider')}
              className="rounded-lg bg-blue-600 px-2.5 py-1 text-white font-medium hover:bg-blue-700 transition"
            >
              Fill Provider
            </button>
            <button
              type="button"
              onClick={() => fillDemo('seeker')}
              className="rounded-lg bg-white border border-blue-200 text-blue-700 px-2.5 py-1 font-medium hover:bg-blue-100 transition"
            >
              Fill Seeker
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <input type="hidden" {...register('role')} value={selectedRole} />

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Email</span>
          <input type="email" {...register('email')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900" placeholder="you@example.com" />
          {errors.email ? <span className="text-xs text-rose-600">{errors.email.message}</span> : null}
        </label>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Password</span>
          <input type="password" {...register('password')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-900" placeholder="Enter your password" />
          {errors.password ? <span className="text-xs text-rose-600">{errors.password.message}</span> : null}
        </label>
      </div>

      {submitError ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

      <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Need an account?</span>
        <a href={selectedRole === 'provider' ? '/register/provider' : '/register/seeker'} className="font-semibold text-slate-950 underline-offset-4 hover:underline">
          Create one
        </a>
      </div>
    </form>
  );
}

export { LoginForm };