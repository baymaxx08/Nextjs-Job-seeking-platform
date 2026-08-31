const express = require('express');

const { validateSchema } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
	providerProfileSchema,
	jobPayloadSchema,
	jobIdParamSchema,
	applicationIdParamSchema,
	applicationStatusSchema,
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
} = require('../controllers/provider');

const router = express.Router();

router.get('/profile', requireAuth, requireRole('provider'), getProfile);
router.put('/profile', requireAuth, requireRole('provider'), validateSchema(providerProfileSchema), updateProfile);
router.get('/jobs', requireAuth, requireRole('provider'), listJobs);
router.post('/jobs', requireAuth, requireRole('provider'), validateSchema(jobPayloadSchema), createJob);
router.get('/jobs/:id', requireAuth, requireRole('provider'), validateSchema(jobIdParamSchema, 'params'), getJob);
router.put('/jobs/:id', requireAuth, requireRole('provider'), validateSchema(jobIdParamSchema, 'params'), validateSchema(jobPayloadSchema), updateJob);
router.delete('/jobs/:id', requireAuth, requireRole('provider'), validateSchema(jobIdParamSchema, 'params'), deleteJob);
router.get('/jobs/:id/applications', requireAuth, requireRole('provider'), validateSchema(jobIdParamSchema, 'params'), listJobApplications);
router.get('/applications', requireAuth, requireRole('provider'), listApplications);
router.get('/applications/:id', requireAuth, requireRole('provider'), validateSchema(applicationIdParamSchema, 'params'), getApplication);
router.put('/applications/:id/status', requireAuth, requireRole('provider'), validateSchema(applicationIdParamSchema, 'params'), validateSchema(applicationStatusSchema), updateApplicationStatus);
router.get('/applications/:id/resume', requireAuth, requireRole('provider'), validateSchema(applicationIdParamSchema, 'params'), getApplicationResume);

module.exports = router;