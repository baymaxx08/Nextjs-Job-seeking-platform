const express = require('express');

const { validateSchema } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { upload } = require('../middleware/upload');
const {
	profileSchema,
	resumeIdParamSchema,
	applicationIdParamSchema,
	savedJobParamSchema,
	getProfile,
	updateProfile,
	uploadResume,
	deleteResume,
	listApplications,
	withdrawApplication,
	listSavedJobs,
	saveJob,
	removeSavedJob,
} = require('../controllers/seeker');

const router = express.Router();

router.get('/profile', requireAuth, requireRole('seeker'), getProfile);
router.put('/profile', requireAuth, requireRole('seeker'), validateSchema(profileSchema), updateProfile);
router.post('/resume', requireAuth, requireRole('seeker'), upload.single('resume'), uploadResume);
router.delete('/resume/:id', requireAuth, requireRole('seeker'), validateSchema(resumeIdParamSchema, 'params'), deleteResume);
router.get('/applications', requireAuth, requireRole('seeker'), listApplications);
router.delete('/applications/:id', requireAuth, requireRole('seeker'), validateSchema(applicationIdParamSchema, 'params'), withdrawApplication);
router.get('/saved-jobs', requireAuth, requireRole('seeker'), listSavedJobs);
router.post('/saved-jobs/:jobId', requireAuth, requireRole('seeker'), validateSchema(savedJobParamSchema, 'params'), saveJob);
router.delete('/saved-jobs/:jobId', requireAuth, requireRole('seeker'), validateSchema(savedJobParamSchema, 'params'), removeSavedJob);

module.exports = router;