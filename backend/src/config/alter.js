require('dotenv').config();
const { pool } = require('./db');

async function alter() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running alterations...');
    await client.query(`
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_sold BOOLEAN DEFAULT FALSE;
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;
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
