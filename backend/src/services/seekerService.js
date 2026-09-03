/**
 * Seeker service helper to resolve and ensure consistent seeker profiles across PostgreSQL
 * and mock storage, preventing foreign key constraint violations between users and job_seekers.
 */

async function getOrCreateSeekerId(client, user) {
  const userId = typeof user === 'object' && user ? user.id : user;
  if (!userId) {
    return null;
  }

  // 1. Check if job_seekers record already exists for this user_id
  const existing = await client.query(
    'SELECT id FROM job_seekers WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  if (existing.rows && existing.rows.length > 0 && existing.rows[0]?.id) {
    return Number(existing.rows[0].id);
  }

  // 2. Derive a clean default full name from email or payload
  let fullName = 'Job Seeker';
  if (typeof user === 'object' && user?.email) {
    fullName = user.email.split('@')[0].replace(/[._-]/g, ' ');
    fullName = fullName.replace(/\b\w/g, (c) => c.toUpperCase());
  } else {
    try {
      const userRes = await client.query('SELECT email FROM users WHERE id = $1 LIMIT 1', [userId]);
      if (userRes.rows && userRes.rows[0]?.email) {
        fullName = userRes.rows[0].email.split('@')[0].replace(/[._-]/g, ' ');
        fullName = fullName.replace(/\b\w/g, (c) => c.toUpperCase());
      }
    } catch {
      // Fallback to default
    }
  }

  // 3. Upsert job_seekers record ensuring the foreign key constraint is satisfied
  const inserted = await client.query(
    `INSERT INTO job_seekers (user_id, full_name, availability)
     VALUES ($1, $2, 'immediate')
     ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [userId, fullName]
  );

  return Number(inserted.rows?.[0]?.id || null);
}

module.exports = {
  getOrCreateSeekerId,
};
