const express = require('express');

const { requireAuth } = require('../middleware/auth');
const {
	listNotifications,
	markNotificationRead,
	markAllNotificationsRead,
} = require('../controllers/notifications');

const router = express.Router();

router.get('/', requireAuth, listNotifications);
router.put('/:id/read', requireAuth, markNotificationRead);
router.put('/read-all', requireAuth, markAllNotificationsRead);

module.exports = router;