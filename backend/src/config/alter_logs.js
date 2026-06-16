require('dotenv').config();
const { pool } = require('./db');

async function alter() {
  const client = await pool.connect();
  try {
    console.log('🔄 Creating logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
        user_name   VARCHAR(120),
        user_email  VARCHAR(200),
        action      VARCHAR(100) NOT NULL,
        entity      VARCHAR(50),
        entity_id   INTEGER,
        detail      TEXT,
        ip          VARCHAR(50),
        user_agent  TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_logs_user ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_logs_action ON activity_logs(action);
      CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at DESC);
    `);
    console.log('✅ Done!');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}
alter();
