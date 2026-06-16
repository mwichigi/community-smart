const { query } = require('../config/db');

const log = async (req, action, entity = null, entityId = null, detail = null) => {
  try {
    const user = req.user || null;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    await query(
      `INSERT INTO activity_logs (user_id, user_name, user_email, action, entity, entity_id, detail, ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user?.id || null,
        user?.name || null,
        user?.email || null,
        action,
        entity,
        entityId,
        detail,
        ip,
        userAgent,
      ]
    );
  } catch (err) {
    console.error('Log error:', err.message);
  }
};

module.exports = { log };
