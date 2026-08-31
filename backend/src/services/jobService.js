const { countJobs, findJobs, findJobById } = require('../models/jobs');

function normalizeJobRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    provider_id: row.provider_id,
    title: row.title,
    description: row.description,
    requirements: row.requirements,
    responsibilities: row.responsibilities,
    location: row.location,
    is_remote: row.is_remote,
    job_type: row.job_type,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    currency: row.currency,
    experience_level: row.experience_level,
    status: row.status,
    application_deadline: row.application_deadline,
    created_at: row.created_at,
    updated_at: row.updated_at,
    required_skill_count: Number(row.required_skill_count || 0),
    skills: Array.isArray(row.skills) ? row.skills : [],
    company: {
      name: row.company_name,
      industry: row.industry,
      size: row.company_size,
      location: row.company_location,
      logo_url: row.logo_url,
    },
    total_count: Number(row.total_count || 0),
  };
}

function normalizeJobDetail(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    provider_id: row.provider_id,
    title: row.title,
    description: row.description,
    requirements: row.requirements,
    responsibilities: row.responsibilities,
    location: row.location,
    is_remote: row.is_remote,
    job_type: row.job_type,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    currency: row.currency,
    experience_level: row.experience_level,
    status: row.status,
    application_deadline: row.application_deadline,
    created_at: row.created_at,
    updated_at: row.updated_at,
    skills: Array.isArray(row.skills) ? row.skills : [],
    company: {
      name: row.company_name,
      industry: row.industry,
      size: row.company_size,
      description: row.company_description,
      website: row.website,
      location: row.company_location,
      logo_url: row.logo_url,
      founded_year: row.founded_year,
    },
  };
}

async function getJobListings(filters) {
  const rows = await findJobs(filters);
  const totalCount = await countJobs(filters);

  return {
    jobs: rows.map((row) => ({
      ...normalizeJobRow(row),
      total_count: totalCount,
    })),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / filters.limit) || 0,
    },
  };
}

async function getJobDetails(jobId) {
  const row = await findJobById(jobId);
  return normalizeJobDetail(row);
}

module.exports = {
  normalizeJobRow,
  normalizeJobDetail,
  getJobListings,
  getJobDetails,
};