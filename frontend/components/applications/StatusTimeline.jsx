function StatusTimeline({ status }) {
  const steps = [
    { key: 'applied', label: 'Applied' },
    { key: 'shortlisted', label: 'Shortlisted' },
    { key: 'interview', label: 'Interview' },
    { key: 'decision', label: 'Decision' },
  ];

  const activeIndex = status === 'rejected' || status === 'hired' ? 3 : Math.max(0, steps.findIndex((step) => step.key === status));

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => (
        <div key={step.key} className={`rounded-2xl border p-4 ${index <= activeIndex ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
          <p className="text-xs uppercase tracking-[0.25em]">Step {index + 1}</p>
          <p className="mt-2 text-sm font-semibold">{step.label}</p>
        </div>
      ))}
    </div>
  );
}

export { StatusTimeline };