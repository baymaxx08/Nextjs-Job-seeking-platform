function StatusTimeline({ status }) {
  const isRejected = status === 'rejected';
  const isHired = status === 'hired';

  const steps = [
    { key: 'applied', label: 'Application Submitted', desc: 'Received by employer' },
    { key: 'shortlisted', label: 'Shortlisted', desc: 'Profile under review' },
    { key: 'interview', label: 'Interview Scheduled', desc: 'Meeting with hiring team' },
    { 
      key: 'decision', 
      label: isHired ? 'Selected (Hired)' : isRejected ? 'Not Selected' : 'Final Decision', 
      desc: isHired ? 'Offer extended!' : isRejected ? 'Position closed' : 'Awaiting review' 
    },
  ];

  const getStepIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'applied': return 0;
      case 'shortlisted': return 1;
      case 'interview': return 2;
      case 'hired':
      case 'rejected': return 3;
      default: return 0;
    }
  };

  const activeIndex = getStepIndex(status);

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const isCurrent = index === activeIndex;
        const isPast = index < activeIndex;
        
        let containerStyle = 'border-slate-200 bg-slate-50 text-slate-500';
        let badgeStyle = 'text-slate-400';

        if (isCurrent) {
          if (isHired) {
            containerStyle = 'border-emerald-600 bg-emerald-950 text-white shadow-sm ring-1 ring-emerald-500';
            badgeStyle = 'text-emerald-300';
          } else if (isRejected) {
            containerStyle = 'border-rose-600 bg-rose-950 text-white shadow-sm ring-1 ring-rose-500';
            badgeStyle = 'text-rose-300';
          } else if (status === 'interview') {
            containerStyle = 'border-indigo-600 bg-indigo-950 text-white shadow-sm ring-1 ring-indigo-500';
            badgeStyle = 'text-indigo-300';
          } else if (status === 'shortlisted') {
            containerStyle = 'border-amber-600 bg-amber-950 text-white shadow-sm ring-1 ring-amber-500';
            badgeStyle = 'text-amber-300';
          } else {
            containerStyle = 'border-slate-900 bg-slate-950 text-white shadow-sm';
            badgeStyle = 'text-slate-400';
          }
        } else if (isPast && !isRejected) {
          containerStyle = 'border-slate-300 bg-slate-100 text-slate-800 font-medium';
          badgeStyle = 'text-slate-600';
        }

        return (
          <div key={step.key} className={`rounded-2xl border p-4 transition ${containerStyle}`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                Step {index + 1}
              </span>
              {isPast && !isRejected && (
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="mt-2 text-sm font-semibold tracking-tight">{step.label}</p>
            <p className={`mt-0.5 text-xs ${isCurrent ? 'opacity-85' : 'text-slate-400'}`}>{step.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

export { StatusTimeline };