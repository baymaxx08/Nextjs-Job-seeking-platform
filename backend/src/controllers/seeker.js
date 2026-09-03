const fs = require('fs/promises');
const path = require('path');
const { z } = require('zod');

const { pool } = require('../config/db');
const { deleteLocalFile, buildResumePath, ensureResumeFileExists } = require('../services/fileService');
const { getOrCreateSeekerId } = require('../services/seekerService');

const profileSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  headline: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  linkedinUrl: z.string().trim().url().optional().or(z.literal('')),
  portfolioUrl: z.string().trim().url().optional().or(z.literal('')),
  yearsOfExperience: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number().int().min(0).optional()),
  availability: z.enum(['immediate', '2weeks', '1month']).optional(),
  skills: z
    .union([z.array(z.string()), z.string()])
    .optional(),
});

const resumeIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const applicationIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const savedJobParamSchema = z.object({
  jobId: z.coerce.number().int().positive(),
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

async function getProfile(req, res, next) {
  const client = await pool.connect();

  try {
    const seekerId = await getOrCreateSeekerId(client, req.user);

    const result = await client.query(
      `SELECT
        u.id AS user_id,
        u.email,
        u.role,
        u.is_verified,
        u.created_at AS user_created_at,
        u.updated_at AS user_updated_at,
        js.id AS seeker_id,
        js.full_name,
        js.headline,
        js.bio,
        js.location,
        js.phone,
        js.linkedin_url,
        js.portfolio_url,
        js.years_of_experience,
        js.availability,
        js.profile_photo_url,
        COALESCE(JSON_AGG(DISTINCT s.name) FILTER (WHERE s.id IS NOT NULL), '[]'::json) AS skills
      FROM users u
      INNER JOIN job_seekers js ON js.user_id = u.id
      LEFT JOIN seeker_skills ss ON ss.seeker_id = js.id
      LEFT JOIN skills s ON s.id = ss.skill_id
      WHERE u.id = $1 AND u.role = 'seeker'
      GROUP BY u.id, js.id
      LIMIT 1`,
      [req.user.id]
    );

    const row = result.rows[0];

    const resumesResult = await client.query(
      `SELECT id, seeker_id, file_name, file_path, file_size, is_default, uploaded_at
       FROM resumes
       WHERE seeker_id = $1 OR seeker_id = $2
       ORDER BY uploaded_at DESC`,
      [seekerId, req.user.id]
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Seeker profile not found',
        errors: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          full_name: row.full_name,
          headline: row.headline,
          bio: row.bio,
          location: row.location,
          phone: row.phone,
          linkedin_url: row.linkedin_url,
          portfolio_url: row.portfolio_url,
          years_of_experience: row.years_of_experience,
          availability: row.availability,
          profile_photo_url: row.profile_photo_url,
        },
        skills: Array.isArray(row.skills) ? row.skills : [],
        resumes: resumesResult.rows,
      },
      message: 'Profile retrieved successfully',
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
    const parsedSkills = normalizeSkills(req.body.skills);
    const profilePayload = {
      ...req.body,
      skills: parsedSkills,
    };

    await client.query('BEGIN');

    const seekerResult = await client.query(
      `UPDATE job_seekers
       SET full_name = COALESCE($1, full_name),
           headline = COALESCE($2, headline),
           bio = COALESCE($3, bio),
           location = COALESCE($4, location),
           phone = COALESCE($5, phone),
           linkedin_url = COALESCE(NULLIF($6, ''), linkedin_url),
           portfolio_url = COALESCE(NULLIF($7, ''), portfolio_url),
           years_of_experience = COALESCE($8, years_of_experience),
           availability = COALESCE($9, availability)
       WHERE user_id = $10
       RETURNING id`,
      [
        profilePayload.fullName || null,
        profilePayload.headline || null,
        profilePayload.bio || null,
        profilePayload.location || null,
        profilePayload.phone || null,
        profilePayload.linkedinUrl || null,
        profilePayload.portfolioUrl || null,
        profilePayload.yearsOfExperience ?? null,
        profilePayload.availability || null,
        req.user.id,
      ]
    );

    if (seekerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Seeker profile not found',
        errors: null,
      });
    }

    if (profilePayload.skills.length > 0) {
      const skillIds = [];

      for (const skillName of profilePayload.skills) {
        const skillResult = await client.query(
          `INSERT INTO skills (name)
           VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [skillName]
        );

        skillIds.push(skillResult.rows[0].id);
      }

      await client.query('DELETE FROM seeker_skills WHERE seeker_id = $1', [seekerResult.rows[0].id]);

      for (const skillId of skillIds) {
        await client.query(
          'INSERT INTO seeker_skills (seeker_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [seekerResult.rows[0].id, skillId]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Profile updated successfully',
      errors: null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

async function uploadResume(req, res, next) {
  const client = await pool.connect();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Resume file is required',
        errors: null,
      });
    }

    const seekerId = await getOrCreateSeekerId(client, req.user);
    if (!seekerId) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Job seeker profile not found',
        errors: null,
      });
    }

    const isDefault = req.body.isDefault === 'true' || req.body.isDefault === true;
    const filePath = buildResumePath(req.user.id, req.file.filename);

    await client.query('BEGIN');

    if (isDefault) {
      await client.query(
        'UPDATE resumes SET is_default = FALSE WHERE seeker_id = $1 OR seeker_id = $2',
        [seekerId, req.user.id]
      );
    }

    const resumeResult = await client.query(
      `INSERT INTO resumes (seeker_id, file_name, file_path, file_size, is_default)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, seeker_id, file_name, file_path, file_size, is_default, uploaded_at`,
      [seekerId, req.file.originalname, filePath, req.file.size, isDefault]
    );

    if (!isDefault) {
      const defaultCount = await client.query(
        'SELECT COUNT(*)::INTEGER AS total FROM resumes WHERE (seeker_id = $1 OR seeker_id = $2) AND is_default = TRUE',
        [seekerId, req.user.id]
      );
      const total = Number(defaultCount.rows?.[0]?.total ?? 0);
      if (total === 0) {
        await client.query('UPDATE resumes SET is_default = TRUE WHERE id = $1', [resumeResult.rows[0].id]);
        resumeResult.rows[0].is_default = true;
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: { resume: resumeResult.rows[0] },
      message: 'Resume uploaded successfully',
      errors: null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

async function getSeekerResume(req, res, next) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const seekerId = await getOrCreateSeekerId(client, req.user);

    const result = await client.query(
      'SELECT id, seeker_id, file_name, file_path FROM resumes WHERE id = $1 AND (seeker_id = $2 OR seeker_id = $3) LIMIT 1',
      [id, seekerId, req.user.id]
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
    await ensureResumeFileExists(absolutePath, resume.file_name, req.user.email || 'Candidate');

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

async function deleteResume(req, res, next) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const seekerId = await getOrCreateSeekerId(client, req.user);

    const result = await client.query(
      'SELECT id, file_path FROM resumes WHERE id = $1 AND (seeker_id = $2 OR seeker_id = $3) LIMIT 1',
      [id, seekerId, req.user.id]
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

    await client.query('BEGIN');
    await client.query('DELETE FROM resumes WHERE id = $1 AND (seeker_id = $2 OR seeker_id = $3)', [id, seekerId, req.user.id]);
    await client.query('COMMIT');

    const absolutePath = path.join(__dirname, '..', '..', resume.file_path);
    await deleteLocalFile(absolutePath);

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Resume deleted successfully',
      errors: null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

async function listApplications(req, res, next) {
  const client = await pool.connect();

  try {
    const seekerId = await getOrCreateSeekerId(client, req.user);

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
        j.job_type,
        j.location AS job_location,
        j.is_remote,
        j.status AS job_status,
        jp.company_name,
        r.file_name AS resume_file_name,
        r.file_path AS resume_file_path
      FROM applications a
      INNER JOIN jobs j ON j.id = a.job_id
      INNER JOIN job_providers jp ON jp.id = j.provider_id
      LEFT JOIN resumes r ON r.id = a.resume_id
      WHERE (a.seeker_id = $1 OR a.seeker_id = $2)
      ORDER BY a.applied_at DESC`,
      [seekerId, req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: { applications: result.rows },
      message: 'Applications retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function withdrawApplication(req, res, next) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const seekerId = await getOrCreateSeekerId(client, req.user);

    const result = await client.query(
      'SELECT id, status FROM applications WHERE id = $1 AND (seeker_id = $2 OR seeker_id = $3) LIMIT 1',
      [id, seekerId, req.user.id]
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

    if (application.status !== 'applied') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'This application has already been reviewed and cannot be withdrawn',
        errors: null,
      });
    }

    await client.query('DELETE FROM applications WHERE id = $1 AND (seeker_id = $2 OR seeker_id = $3)', [id, seekerId, req.user.id]);

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Application withdrawn successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function listSavedJobs(req, res, next) {
  const client = await pool.connect();

  try {
    const seekerId = await getOrCreateSeekerId(client, req.user);

    const result = await client.query(
      `SELECT
        sj.id,
        sj.saved_at,
        j.id AS job_id,
        j.title,
        j.description,
        j.location,
        j.is_remote,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.currency,
        j.status,
        jp.company_name,
        jp.logo_url
      FROM saved_jobs sj
      INNER JOIN jobs j ON j.id = sj.job_id
      INNER JOIN job_providers jp ON jp.id = j.provider_id
      WHERE (sj.seeker_id = $1 OR sj.seeker_id = $2)
      ORDER BY sj.saved_at DESC`,
      [seekerId, req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: { saved_jobs: result.rows },
      message: 'Saved jobs retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function saveJob(req, res, next) {
  const client = await pool.connect();

  try {
    const jobId = Number(req.params.jobId);
    const seekerId = await getOrCreateSeekerId(client, req.user);

    const jobResult = await client.query('SELECT id FROM jobs WHERE id = $1 LIMIT 1', [jobId]);

    if (!jobResult.rows[0]) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Job not found',
        errors: null,
      });
    }

    await client.query(
      `INSERT INTO saved_jobs (seeker_id, job_id)
       VALUES ($1, $2)
       ON CONFLICT (seeker_id, job_id) DO NOTHING`,
      [seekerId, jobId]
    );

    return res.status(201).json({
      success: true,
      data: null,
      message: 'Job saved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function removeSavedJob(req, res, next) {
  const client = await pool.connect();

  try {
    const jobId = Number(req.params.jobId);
    const seekerId = await getOrCreateSeekerId(client, req.user);

    await client.query(
      'DELETE FROM saved_jobs WHERE (seeker_id = $1 OR seeker_id = $2) AND job_id = $3',
      [seekerId, req.user.id, jobId]
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Job removed from saved list',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  profileSchema,
  resumeIdParamSchema,
  applicationIdParamSchema,
  savedJobParamSchema,
  getProfile,
  updateProfile,
  uploadResume,
  getSeekerResume,
  deleteResume,
  listApplications,
  withdrawApplication,
  listSavedJobs,
  saveJob,
  removeSavedJob,
  normalizeSkills,
};