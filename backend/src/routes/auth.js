const express = require('express');

const { validateSchema } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const {
	loginSchema,
	registerSeekerSchema,
	registerProviderSchema,
	registerSeeker,
	registerProvider,
	login,
	logout,
	refreshToken,
	getMe,
} = require('../controllers/auth');

const router = express.Router();

router.post('/register/seeker', validateSchema(registerSeekerSchema), registerSeeker);
router.post('/register/provider', validateSchema(registerProviderSchema), registerProvider);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', requireAuth, getMe);

module.exports = router;