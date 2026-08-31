const { z } = require('zod');

const { getJobDetails, getJobListings } = require('../services/jobService');

const jobListQuerySchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  experience: z.enum(['entry', 'mid', 'senior']).optional(),
  salary_min: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number().int().min(0).optional()),
  page: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return 1;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number().int().min(1).default(1)),
  limit: z.preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return 10;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number().int().min(1).max(50).default(10)),
  is_remote: z.enum(['true', 'false']).optional(),
  posted: z.enum(['24h', '7d', '30d']).optional(),
});

const jobIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

function resolvePostedAfter(posted) {
  if (posted === '24h') {
    return new Date(Date.now() - 24 * 60 * 60 * 1000);
  }

  if (posted === '7d') {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  if (posted === '30d') {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  return null;
}

async function listJobs(req, res, next) {
  try {
    const query = req.query;
    const filters = {
      search: query.search,
      location: query.location,
      type: query.type,
      experience: query.experience,
      salary_min: query.salary_min,
      page: query.page,
      limit: query.limit,
      is_remote: query.is_remote === 'true' ? true : query.is_remote === 'false' ? false : undefined,
      posted_after: resolvePostedAfter(query.posted),
    };

    const result = await getJobListings(filters);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Jobs retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  }
}

async function getJob(req, res, next) {
  try {
    const { id } = req.params;
    const job = await getJobDetails(Number(id));

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
  }
}

module.exports = {
  jobListQuerySchema,
  jobIdParamSchema,
  listJobs,
  getJob,
};