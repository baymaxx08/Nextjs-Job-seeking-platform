import { RegisterForm } from '../../../components/forms/RegisterForm';

export default function SeekerRegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-glow backdrop-blur lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Job Seeker</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Build a profile that gets noticed.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 md:text-base">Create your account, add your basics, then move into the seeker dashboard to upload resumes and apply for roles.</p>
        </section>

        <div className="flex items-center justify-center">
          <RegisterForm role="seeker" />
        </div>
      </div>
    </main>
  );
}