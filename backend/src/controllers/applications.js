const { z } = require('zod');

const { pool } = require('../config/db');
const { sendEmail } = require('../services/emailService');

const applySchema = z.object({
  resumeId: z.coerce.number().int().positive(),
  coverLetter: z.string().trim().max(5000).optional(),
});

function createHttpError(statusCode, message, errors = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
}

async function applyToJob(req, res, next) {
  const client = await pool.connect();

  try {
    const jobId = Number(req.params.id);
    const seekerId = req.user.id;
    const { resumeId, coverLetter } = req.body;

    const jobResult = await client.query(
      `SELECT j.id, j.title, j.status, jp.user_id AS provider_user_id, u.email AS provider_email, jp.company_name
       FROM jobs j
       INNER JOIN job_providers jp ON jp.id = j.provider_id
       INNER JOIN users u ON u.id = jp.user_id
       WHERE j.id = $1
       LIMIT 1`,
      [jobId]
    );

    const job = jobResult.rows[0];

    if (!job) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Job not found',
        errors: null,
      });
    }

    if (job.status !== 'open') {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'This job is no longer accepting applications',
        errors: null,
      });
    }

    const resumeResult = await client.query(
      `SELECT id, seeker_id, file_name, file_path, file_size, is_default
       FROM resumes
       WHERE id = $1 AND seeker_id = $2
       LIMIT 1`,
      [resumeId, seekerId]
    );

    const resume = resumeResult.rows[0];

    if (!resume) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Resume not found',
        errors: null,
      });
    }

    const existingApplication = await client.query(
      'SELECT id FROM applications WHERE job_id = $1 AND seeker_id = $2 LIMIT 1',
      [jobId, seekerId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'You have already applied for this job',
        errors: null,
      });
    }

    await client.query('BEGIN');

    const applicationResult = await client.query(
      `INSERT INTO applications (job_id, seeker_id, resume_id, cover_letter, status)
       VALUES ($1, $2, $3, $4, 'applied')
       RETURNING id, job_id, seeker_id, resume_id, cover_letter, status, applied_at, updated_at`,
      [jobId, seekerId, resumeId, coverLetter || null]
    );

    const application = applicationResult.rows[0];

    await client.query(
      `INSERT INTO notifications (user_id, type, message, is_read)
       VALUES ($1, $2, $3, FALSE)`,
      [
        job.provider_user_id,
        'new_application',
        `New application for ${job.title} at ${job.company_name}`,
      ]
    );

    await client.query(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id)
       VALUES ($1, $2, $3, $4)`,
      [seekerId, 'apply', 'application', application.id]
    );

    await client.query('COMMIT');

    await sendEmail({
      to: job.provider_email,
      subject: `New application for ${job.title}`,
      text: `A new application has been submitted for ${job.title}.`,
      html: `<p>A new application has been submitted for <strong>${job.title}</strong>.</p>`,
    });

    return res.status(201).json({
      success: true,
      data: { application },
      message: 'Application submitted successfully',
      errors: null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  applySchema,
  applyToJob,
  createHttpError,
};