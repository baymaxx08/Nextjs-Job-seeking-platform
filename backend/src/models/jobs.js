const { pool } = require('../config/db');

function buildJobsFilterConditions(filters) {
  const conditions = ["j.status = 'open'"];
  const params = [];

  if (filters.search) {
    params.push(filters.search);
    conditions.push(`to_tsvector('english', coalesce(j.title, '') || ' ' || coalesce(j.description, '') || ' ' || coalesce(j.requirements, '') || ' ' || coalesce(j.responsibilities, '')) @@ websearch_to_tsquery('english', $${params.length})`);
  }

  if (filters.location) {
    params.push(`%${filters.location}%`);
    conditions.push(`j.location ILIKE $${params.length}`);
  }

  if (filters.type) {
    params.push(filters.type);
    conditions.push(`j.job_type = $${params.length}`);
  }

  if (filters.experience) {
    params.push(filters.experience);
    conditions.push(`j.experience_level = $${params.length}`);
  }

  if (typeof filters.salary_min === 'number') {
    params.push(filters.salary_min);
    conditions.push(`COALESCE(j.salary_max, j.salary_min) >= $${params.length}`);
  }

  if (typeof filters.is_remote === 'boolean') {
    params.push(filters.is_remote);
    conditions.push(`j.is_remote = $${params.length}`);
  }

  if (filters.posted_after) {
    params.push(filters.posted_after);
    conditions.push(`j.created_at >= $${params.length}`);
  }

  return { conditions, params };
}

async function countJobs(filters) {
  const { conditions, params } = buildJobsFilterConditions(filters);
  const queryText = `
    SELECT COUNT(*)::INTEGER AS total_count
    FROM jobs j
    WHERE ${conditions.join(' AND ')}
  `;

  const result = await pool.query(queryText, params);
  return result.rows[0]?.total_count || 0;
}

async function findJobs(filters) {
  const { conditions, params } = buildJobsFilterConditions(filters);
  const limit = filters.limit || 10;
  const page = filters.page || 1;
  const offset = (page - 1) * limit;

  const queryText = `
    WITH job_rows AS (
      SELECT
        j.id,
        j.provider_id,
        j.title,
        j.description,
        j.requirements,
        j.responsibilities,
        j.location,
        j.is_remote,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.currency,
        j.experience_level,
        j.status,
        j.application_deadline,
        j.created_at,
        j.updated_at,
        jp.company_name,
        jp.industry,
        jp.company_size,
        jp.location AS company_location,
        jp.logo_url,
        COALESCE(COUNT(DISTINCT js.skill_id), 0) AS required_skill_count,
        COALESCE(JSON_AGG(DISTINCT s.name) FILTER (WHERE s.id IS NOT NULL), '[]'::json) AS skills
      FROM jobs j
      INNER JOIN job_providers jp ON jp.id = j.provider_id
      LEFT JOIN job_skills js ON js.job_id = j.id
      LEFT JOIN skills s ON s.id = js.skill_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY j.id, jp.id
      ORDER BY j.created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    )
    SELECT job_rows.*
    FROM job_rows
  `;

  const result = await pool.query(queryText, [...params, limit, offset]);
  return result.rows;
}

async function findJobById(jobId) {
  const result = await pool.query(
    `SELECT
      j.id,
      j.provider_id,
      j.title,
      j.description,
      j.requirements,
      j.responsibilities,
      j.location,
      j.is_remote,
      j.job_type,
      j.salary_min,
      j.salary_max,
      j.currency,
      j.experience_level,
      j.status,
      j.application_deadline,
      j.created_at,
      j.updated_at,
      jp.company_name,
      jp.industry,
      jp.company_size,
      jp.description AS company_description,
      jp.website,
      jp.location AS company_location,
      jp.logo_url,
      jp.founded_year,
      COALESCE(JSON_AGG(DISTINCT s.name) FILTER (WHERE s.id IS NOT NULL), '[]'::json) AS skills
    FROM jobs j
    INNER JOIN job_providers jp ON jp.id = j.provider_id
    LEFT JOIN job_skills js ON js.job_id = j.id
    LEFT JOIN skills s ON s.id = js.skill_id
    WHERE j.id = $1
    GROUP BY j.id, jp.id
    LIMIT 1`,
    [jobId]
  );

  return result.rows[0] || null;
}

module.exports = {
  buildJobsFilterConditions,
  countJobs,
  findJobs,
  findJobById,
};