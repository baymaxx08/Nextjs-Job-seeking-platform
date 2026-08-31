const express = require('express');

const { validateSchema } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { jobListQuerySchema, jobIdParamSchema, listJobs, getJob } = require('../controllers/jobs');
const { applySchema, applyToJob } = require('../controllers/applications');

const router = express.Router();

router.get('/', validateSchema(jobListQuerySchema, 'query'), listJobs);
router.get('/:id', validateSchema(jobIdParamSchema, 'params'), getJob);
router.post('/:id/apply', requireAuth, requireRole('seeker'), validateSchema(jobIdParamSchema, 'params'), validateSchema(applySchema), applyToJob);

module.exports = router;