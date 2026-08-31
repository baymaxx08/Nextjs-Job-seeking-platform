import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-12 lg:px-8">
      <section className="grid w-full gap-10 rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-glow backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
        <div className="space-y-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Job Portal</p>
          <h1 className="max-w-2xl font-display text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">Hire smarter. Apply faster.</h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">A production-ready job portal for seekers and employers with role-based access, resume management, application tracking, and modern search.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
              Sign in
            </Link>
            <Link href="/register/seeker" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5">
              Join as seeker
            </Link>
            <Link href="/register/provider" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5">
              Join as provider
            </Link>
          </div>
        </div>

        <div className="grid gap-4 self-center">
          {[
            ['Seeker dashboard', 'Track applications, saved jobs, and resume uploads.'],
            ['Provider dashboard', 'Post jobs, review applicants, and update statuses.'],
            ['Smart search', 'Filter by role, location, salary, and experience.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}