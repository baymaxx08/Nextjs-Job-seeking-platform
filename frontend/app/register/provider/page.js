import { RegisterForm } from '../../../components/forms/RegisterForm';

export default function ProviderRegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-glow lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Job Provider</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">Post jobs and manage applicants in one place.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 md:text-base">Open your company account, publish roles, and track applicant progress from first application to final hire.</p>
        </section>

        <div className="flex items-center justify-center">
          <RegisterForm role="provider" />
        </div>
      </div>
    </main>
  );
}