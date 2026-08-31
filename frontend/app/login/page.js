import { LoginForm } from '../../components/forms/LoginForm';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-glow lg:p-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Job Portal</p>
            <h1 className="max-w-xl font-display text-4xl font-semibold leading-tight md:text-6xl">A sharper way to hire and get hired.</h1>
            <p className="max-w-lg text-sm leading-7 text-slate-300 md:text-base">One platform for seekers and providers with role-based access, job tracking, and a clean workflow from application to decision.</p>
          </div>
          <div className="grid gap-4 pt-10 sm:grid-cols-3">
            {['Role-based login', 'Resume handling', 'Applicant tracking'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}