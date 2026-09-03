const path = require('path');
const { z } = require('zod');

const { pool } = require('../config/db');
const { sendEmail } = require('../services/emailService');
const { ensureResumeFileExists } = require('../services/fileService');

const currentYear = new Date().getFullYear();

const optionalText = (maxLength) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }, z.string().max(maxLength).optional());

const optionalNumber = () =>
  z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number().int().optional());

const booleanLike = z.preprocess((value) => {
  if (value === true || value === false) {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}, z.boolean().optional());

const providerProfileSchema = z.object({
  companyName: z.string().trim().min(2),
  industry: optionalText(120),
  companySize: optionalText(60),
  description: optionalText(2000),
  website: optionalText(255),
  location: optionalText(120),
  logoUrl: optionalText(255),
  foundedYear: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number().int().min(1800).max(currentYear).optional()),
});

const jobPayloadSchema = z
  .object({
    title: z.string({ required_error: 'Title is required' }).trim().min(2, 'Title must be at least 2 characters'),
    description: z.string({ required_error: 'Description is required' }).trim().min(10, 'Description must be at least 10 characters'),
    requirements: z.string({ required_error: 'Requirements are required' }).trim().min(10, 'Requirements must be at least 10 characters'),
    responsibilities: optionalText(5000),
    location: optionalText(120),
    isRemote: booleanLike,
    is_remote: booleanLike,
    jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
    job_type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
    salaryMin: optionalNumber(),
    salary_min: optionalNumber(),
    salaryMax: optionalNumber(),
    salary_max: optionalNumber(),
    currency: z.preprocess((val) => {
      if (!val || typeof val !== 'string') return 'USD';
      const trimmed = val.trim().toUpperCase();
      return trimmed.length ? trimmed : 'USD';
    }, z.string().max(10).default('USD')),
    experienceLevel: z.enum(['entry', 'mid', 'senior']).optional(),
    experience_level: z.enum(['entry', 'mid', 'senior']).optional(),
    status: z.enum(['open', 'closed', 'filled']).optional().default('open'),
    applicationDeadline: z.string().optional().nullable().or(z.literal('')),
    application_deadline: z.string().optional().nullable().or(z.literal('')),
    skills: z.union([z.array(z.string()), z.string()]).optional(),
  })
  .transform((data) => {
    const isRemote =
      data.isRemote !== undefined
        ? data.isRemote
        : data.is_remote !== undefined
        ? data.is_remote
        : false;

    const jobType = data.jobType || data.job_type || 'full-time';
    const experienceLevel = data.experienceLevel || data.experience_level || 'mid';
    const salaryMin = data.salaryMin !== undefined ? data.salaryMin : data.salary_min;
    const salaryMax = data.salaryMax !== undefined ? data.salaryMax : data.salary_max;
    const applicationDeadline = data.applicationDeadline || data.application_deadline || null;

    return {
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      responsibilities: data.responsibilities || null,
      location: data.location || null,
      isRemote: Boolean(isRemote),
      jobType,
      salaryMin: salaryMin !== undefined ? salaryMin : null,
      salaryMax: salaryMax !== undefined ? salaryMax : null,
      currency: data.currency || 'USD',
      experienceLevel,
      status: data.status || 'open',
      applicationDeadline: applicationDeadline || null,
      skills: data.skills || [],
    };
  });

const jobIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const applicationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const applicationStatusSchema = z.object({
  status: z.enum(['shortlisted', 'interview', 'hired', 'rejected']),
});

function normalizeSkills(skills) {
  if (!skills) {
    return [];
  }

  if (Array.isArray(skills)) {
    return skills.map((skill) => skill.trim()).filter(Boolean);
  }

  return skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function createHttpError(statusCode, message, errors = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
}

async function getProviderId(client, userId) {
  const result = await client.query('SELECT id FROM job_providers WHERE user_id = $1 LIMIT 1', [userId]);
  const provider = result.rows[0];

  if (!provider) {
    return null;
  }

  return provider.id;
}

async function getProfile(req, res, next) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT
        jp.id,
        jp.company_name,
        jp.industry,
        jp.company_size,
        jp.description,
        jp.website,
        jp.location,
        jp.logo_url,
        jp.founded_year,
        jp.created_at,
        jp.updated_at,
        u.email
      FROM job_providers jp
      INNER JOIN users u ON u.id = jp.user_id
      WHERE jp.user_id = $1
      LIMIT 1`,
      [req.user.id]
    );

    const profile = result.rows[0];

    if (!profile) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: { profile },
      message: 'Provider profile retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function updateProfile(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const payload = req.body;

    await client.query(
      `UPDATE job_providers
       SET company_name = $1,
           industry = $2,
           company_size = $3,
           description = $4,
           website = $5,
           location = $6,
           logo_url = $7,
           founded_year = $8
       WHERE id = $9`,
      [
        payload.companyName,
        payload.industry || null,
        payload.companySize || null,
        payload.description || null,
        payload.website || null,
        payload.location || null,
        payload.logoUrl || null,
        payload.foundedYear || null,
        providerId,
      ]
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Provider profile updated successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function syncJobSkills(client, jobId, skills) {
  const normalizedSkills = normalizeSkills(skills);

  await client.query('DELETE FROM job_skills WHERE job_id = $1', [jobId]);

  for (const skillName of normalizedSkills) {
    const skillResult = await client.query(
      `INSERT INTO skills (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [skillName]
    );

    await client.query(
      'INSERT INTO job_skills (job_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [jobId, skillResult.rows[0].id]
    );
  }
}

async function listJobs(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const result = await client.query(
      `SELECT
        j.id,
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
        COALESCE(app_count.application_count, 0) AS application_count
      FROM jobs j
      LEFT JOIN (
        SELECT job_id, COUNT(*)::INTEGER AS application_count
        FROM applications
        GROUP BY job_id
      ) app_count ON app_count.job_id = j.id
      WHERE j.provider_id = $1
      ORDER BY j.created_at DESC`,
      [providerId]
    );

    return res.status(200).json({
      success: true,
      data: { jobs: result.rows },
      message: 'Provider jobs retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function createJob(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    await client.query('BEGIN');

    const jobResult = await client.query(
      `INSERT INTO jobs (
        provider_id,
        title,
        description,
        requirements,
        responsibilities,
        location,
        is_remote,
        job_type,
        salary_min,
        salary_max,
        currency,
        experience_level,
        status,
        application_deadline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id`,
      [
        providerId,
        req.body.title,
        req.body.description,
        req.body.requirements,
        req.body.responsibilities || null,
        req.body.location || null,
        req.body.isRemote || false,
        req.body.jobType,
        req.body.salaryMin || null,
        req.body.salaryMax || null,
        req.body.currency || 'USD',
        req.body.experienceLevel,
        req.body.status || 'open',
        req.body.applicationDeadline || null,
      ]
    );

    await syncJobSkills(client, jobResult.rows[0].id, req.body.skills);

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: { job_id: jobResult.rows[0].id },
      message: 'Job created successfully',
      errors: null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

async function getJob(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const result = await client.query(
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
        COALESCE(JSON_AGG(DISTINCT s.name) FILTER (WHERE s.id IS NOT NULL), '[]'::json) AS skills,
        COALESCE(app_count.application_count, 0) AS application_count
      FROM jobs j
      LEFT JOIN job_skills js ON js.job_id = j.id
      LEFT JOIN skills s ON s.id = js.skill_id
      LEFT JOIN (
        SELECT job_id, COUNT(*)::INTEGER AS application_count
        FROM applications
        GROUP BY job_id
      ) app_count ON app_count.job_id = j.id
      WHERE j.id = $1 AND j.provider_id = $2
      GROUP BY j.id, app_count.application_count
      LIMIT 1`,
      [req.params.id, providerId]
    );

    const job = result.rows[0];

    if (!job) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Job not found',
        errors: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: { job },
      message: 'Job retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function updateJob(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const existingJobResult = await client.query(
      'SELECT id FROM jobs WHERE id = $1 AND provider_id = $2 LIMIT 1',
      [req.params.id, providerId]
    );

    if (!existingJobResult.rows[0]) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Job not found',
        errors: null,
      });
    }

    await client.query('BEGIN');

    await client.query(
      `UPDATE jobs
       SET title = $1,
           description = $2,
           requirements = $3,
           responsibilities = $4,
           location = $5,
           is_remote = $6,
           job_type = $7,
           salary_min = $8,
           salary_max = $9,
           currency = $10,
           experience_level = $11,
           status = $12,
           application_deadline = $13
       WHERE id = $14 AND provider_id = $15`,
      [
        req.body.title,
        req.body.description,
        req.body.requirements,
        req.body.responsibilities || null,
        req.body.location || null,
        req.body.isRemote || false,
        req.body.jobType,
        req.body.salaryMin || null,
        req.body.salaryMax || null,
        req.body.currency || 'USD',
        req.body.experienceLevel,
        req.body.status || 'open',
        req.body.applicationDeadline || null,
        req.params.id,
        providerId,
      ]
    );

    await syncJobSkills(client, req.params.id, req.body.skills);

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Job updated successfully',
      errors: null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

async function deleteJob(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const result = await client.query(
      'DELETE FROM jobs WHERE id = $1 AND provider_id = $2 RETURNING id',
      [req.params.id, providerId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Job not found',
        errors: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Job deleted successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function listJobApplications(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const result = await client.query(
      `SELECT
        a.id,
        a.job_id,
        a.seeker_id,
        a.resume_id,
        a.cover_letter,
        a.status,
        a.applied_at,
        a.updated_at,
        u.email AS seeker_email,
        js.full_name,
        js.headline,
        js.location,
        js.years_of_experience,
        r.file_name AS resume_file_name,
        r.file_path AS resume_file_path,
        COALESCE(JSON_AGG(DISTINCT s.name) FILTER (WHERE s.id IS NOT NULL), '[]'::json) AS seeker_skills,
        COALESCE(JSON_AGG(DISTINCT job_skill.name) FILTER (WHERE job_skill.id IS NOT NULL), '[]'::json) AS job_skills
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      LEFT JOIN job_seekers js ON (js.id = a.seeker_id OR js.user_id = a.seeker_id)
      LEFT JOIN users u ON (u.id = js.user_id OR u.id = a.seeker_id)
      LEFT JOIN resumes r ON r.id = a.resume_id
      LEFT JOIN seeker_skills ss ON ss.seeker_id = js.id
      LEFT JOIN skills s ON s.id = ss.skill_id
      LEFT JOIN job_skills jsk ON jsk.job_id = j.id
      LEFT JOIN skills job_skill ON job_skill.id = jsk.skill_id
      WHERE a.job_id = $1 AND j.provider_id = $2
      GROUP BY a.id, u.email, js.id, r.id, j.id
      ORDER BY a.applied_at DESC`,
      [req.params.id, providerId]
    );

    return res.status(200).json({
      success: true,
      data: { applications: result.rows },
      message: 'Job applications retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function listApplications(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const result = await client.query(
      `SELECT
        a.id,
        a.job_id,
        a.status,
        a.applied_at,
        a.updated_at,
        j.title,
        jp.company_name,
        js.full_name,
        js.headline,
        js.location
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      INNER JOIN job_providers jp ON jp.id = j.provider_id
      INNER JOIN users u ON u.id = a.seeker_id
      INNER JOIN job_seekers js ON js.user_id = u.id
      WHERE j.provider_id = $1
      ORDER BY a.applied_at DESC`,
      [providerId]
    );

    return res.status(200).json({
      success: true,
      data: { applications: result.rows },
      message: 'Provider applications retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function getApplication(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const result = await client.query(
      `SELECT
        a.id,
        a.job_id,
        a.seeker_id,
        a.resume_id,
        a.cover_letter,
        a.status,
        a.applied_at,
        a.updated_at,
        j.title,
        u.email AS seeker_email,
        js.full_name,
        js.headline,
        js.location,
        js.years_of_experience,
        r.file_name AS resume_file_name,
        r.file_path AS resume_file_path,
        COALESCE(JSON_AGG(DISTINCT s.name) FILTER (WHERE s.id IS NOT NULL), '[]'::json) AS seeker_skills,
        COALESCE(JSON_AGG(DISTINCT job_skill.name) FILTER (WHERE job_skill.id IS NOT NULL), '[]'::json) AS job_skills
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      LEFT JOIN job_seekers js ON (js.id = a.seeker_id OR js.user_id = a.seeker_id)
      LEFT JOIN users u ON (u.id = js.user_id OR u.id = a.seeker_id)
      LEFT JOIN resumes r ON r.id = a.resume_id
      LEFT JOIN seeker_skills ss ON ss.seeker_id = js.id
      LEFT JOIN skills s ON s.id = ss.skill_id
      LEFT JOIN job_skills jsk ON jsk.job_id = j.id
      LEFT JOIN skills job_skill ON job_skill.id = jsk.skill_id
      WHERE a.id = $1 AND j.provider_id = $2
      GROUP BY a.id, j.id, u.email, js.id, r.id
      LIMIT 1`,
      [req.params.id, providerId]
    );

    const application = result.rows[0];

    if (!application) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Application not found',
        errors: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: { application },
      message: 'Application retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

function canTransitionStatus(currentStatus, nextStatus) {
  if (currentStatus === 'rejected' || currentStatus === 'hired') {
    return false;
  }

  if (currentStatus === 'applied') {
    return ['shortlisted', 'interview', 'hired', 'rejected'].includes(nextStatus);
  }

  if (currentStatus === 'shortlisted') {
    return ['interview', 'hired', 'rejected'].includes(nextStatus);
  }

  if (currentStatus === 'interview') {
    return ['hired', 'rejected'].includes(nextStatus);
  }

  return false;
}

async function updateApplicationStatus(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const applicationResult = await client.query(
      `SELECT
        a.id,
        a.status,
        a.job_id,
        a.seeker_id,
        j.title,
        COALESCE(u.id, js.user_id, a.seeker_id) AS seeker_user_id,
        u.email AS seeker_email,
        jp.company_name
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      INNER JOIN job_providers jp ON jp.id = j.provider_id
      LEFT JOIN job_seekers js ON (js.id = a.seeker_id OR js.user_id = a.seeker_id)
      LEFT JOIN users u ON (u.id = js.user_id OR u.id = a.seeker_id)
      WHERE a.id = $1 AND j.provider_id = $2
      LIMIT 1`,
      [req.params.id, providerId]
    );

    const application = applicationResult.rows[0];

    if (!application) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Application not found',
        errors: null,
      });
    }

    if (!canTransitionStatus(application.status, req.body.status)) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'Invalid application status transition',
        errors: null,
      });
    }

    await client.query('BEGIN');

    await client.query(
      'UPDATE applications SET status = $1 WHERE id = $2',
      [req.body.status, req.params.id]
    );

    await client.query(
      `INSERT INTO notifications (user_id, type, message, is_read)
       VALUES ($1, $2, $3, FALSE)`,
      [
        application.seeker_user_id || application.seeker_id,
        'application_status_updated',
        `Your application for ${application.title} was updated to ${req.body.status}`,
      ]
    );

    await client.query(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, `application:${req.body.status}`, 'application', Number(req.params.id)]
    );

    await client.query('COMMIT');

    try {
      await sendEmail({
        to: application.seeker_email,
        subject: `Your application for ${application.title} was updated`,
        text: `Your application for ${application.title} at ${application.company_name} was updated to ${req.body.status}.`,
        html: `<p>Your application for <strong>${application.title}</strong> at <strong>${application.company_name}</strong> was updated to <strong>${req.body.status}</strong>.</p>`,
      });
    } catch (emailError) {
      console.error('Failed to send application status email', emailError.message);
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Application status updated successfully',
      errors: null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

async function getApplicationResume(req, res, next) {
  const client = await pool.connect();

  try {
    const providerId = await getProviderId(client, req.user.id);

    if (!providerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Provider profile not found',
        errors: null,
      });
    }

    const result = await client.query(
      `SELECT r.file_name, r.file_path, js.full_name
       FROM applications a
       INNER JOIN jobs j ON j.id = a.job_id
       INNER JOIN resumes r ON r.id = a.resume_id
       LEFT JOIN job_seekers js ON (js.id = a.seeker_id OR js.user_id = a.seeker_id)
       WHERE a.id = $1 AND j.provider_id = $2
       LIMIT 1`,
      [req.params.id, providerId]
    );

    const resume = result.rows[0];

    if (!resume) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Resume not found',
        errors: null,
      });
    }

    const absolutePath = path.join(__dirname, '..', '..', resume.file_path);
    await ensureResumeFileExists(absolutePath, resume.file_name, resume.full_name || 'Candidate');

    const ext = path.extname(resume.file_name || '').toLowerCase();
    const mimeMap = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.rtf': 'application/rtf',
      '.txt': 'text/plain',
    };
    const contentType = mimeMap[ext] || 'application/pdf';

    res.setHeader('Content-Type', contentType);
    if (req.query.inline === 'true') {
      res.setHeader('Content-Disposition', `inline; filename="${resume.file_name}"`);
      return res.sendFile(absolutePath);
    }

    return res.download(absolutePath, resume.file_name);
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  providerProfileSchema,
  jobPayloadSchema,
  jobIdParamSchema,
  applicationIdParamSchema,
  applicationStatusSchema,
  normalizeSkills,
  createHttpError,
  getProviderId,
  getProfile,
  updateProfile,
  listJobs,
  createJob,
  getJob,
  updateJob,
  deleteJob,
  listJobApplications,
  listApplications,
  getApplication,
  updateApplicationStatus,
  getApplicationResume,
};