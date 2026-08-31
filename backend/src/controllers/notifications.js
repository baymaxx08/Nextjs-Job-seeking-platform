const { pool } = require('../config/db');

async function listNotifications(req, res, next) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id, user_id, type, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: { notifications: result.rows },
      message: 'Notifications retrieved successfully',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function markNotificationRead(req, res, next) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Notification not found',
        errors: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Notification marked as read',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

async function markAllNotificationsRead(req, res, next) {
  const client = await pool.connect();

  try {
    await client.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: 'All notifications marked as read',
      errors: null,
    });
  } catch (error) {
    return next(error);
  } finally {
    client.release();
  }
}

module.exports = {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};