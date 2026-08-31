'use client';

import { useMemo, useState } from 'react';

import { StatusBadge } from './StatusBadge';

function ApplicantTable({ applications, onUpdateStatus, onDownloadResume }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const statusMatches = !statusFilter || application.status === statusFilter;
      const searchMatches = !search || [application.full_name, application.seeker_email, application.headline].some((value) => value?.toLowerCase().includes(search.toLowerCase()));
      return statusMatches && searchMatches;
    });
  }, [applications, search, statusFilter]);

  const getMatchPercentage = (application) => {
    const jobSkills = Array.isArray(application.job_skills) ? application.job_skills : [];
    const seekerSkills = Array.isArray(application.seeker_skills) ? application.seeker_skills : [];

    if (!jobSkills.length) {
      return 0;
    }

    const matchedSkills = jobSkills.filter((skill) => seekerSkills.some((candidateSkill) => candidateSkill.toLowerCase() === skill.toLowerCase()));
    return Math.round((matchedSkills.length / jobSkills.length) * 100);
  };

  return (
    <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900" placeholder="Search by name, email, or headline" />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-900">
          <option value="">All statuses</option>
          <option value="applied">Applied</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-3 pr-4">Candidate</th>
              <th className="py-3 pr-4">Applied</th>
              <th className="py-3 pr-4">Skills</th>
              <th className="py-3 pr-4">Match</th>
              <th className="py-3 pr-4">Resume</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredApplications.map((application) => (
              <tr key={application.id}>
                <td className="py-4 pr-4">
                  <p className="font-semibold text-slate-950">{application.full_name}</p>
                  <p className="text-slate-600">{application.seeker_email}</p>
                  <p className="text-slate-500">{application.headline || 'No headline'}</p>
                </td>
                <td className="py-4 pr-4 text-slate-600">{new Date(application.applied_at).toLocaleDateString()}</td>
                <td className="py-4 pr-4">
                  <div className="flex flex-wrap gap-2">
                    {(application.seeker_skills || []).slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 pr-4 font-semibold text-slate-950">{getMatchPercentage(application)}%</td>
                <td className="py-4 pr-4">
                  {application.resume_file_name ? (
                    <button type="button" onClick={() => onDownloadResume(application.id)} className="font-semibold text-slate-950 underline-offset-4 hover:underline">
                      {application.resume_file_name}
                    </button>
                  ) : (
                    <span className="text-slate-500">No resume</span>
                  )}
                </td>
                <td className="py-4 pr-4"><StatusBadge status={application.status} /></td>
                <td className="py-4 pr-4">
                  <select defaultValue="" onChange={(event) => event.target.value && onUpdateStatus(application.id, event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-900">
                    <option value="">Update</option>
                    <option value="shortlisted">Shortlist</option>
                    <option value="interview">Interview</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { ApplicantTable };