const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary } = require('../config/cloudinary');

// GET /api/housing
exports.getHousing = asyncHandler(async (req, res) => {
  const { type, max_price, available = 'true', page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const conditions = [];

  if (available === 'true') conditions.push('h.available = TRUE');
  if (type) { params.push(type); conditions.push(`h.type = $${params.length}`); }
  if (max_price) { params.push(max_price); conditions.push(`h.price <= $${params.length}`); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  params.push(parseInt(limit), offset);

  const sql = `
    SELECT h.*, u.name AS landlord_name, u.phone AS landlord_phone
    FROM housing h JOIN users u ON u.id = h.landlord_id
    ${where}
    ORDER BY h.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;
  const countSql = `SELECT COUNT(*) FROM housing h ${where}`;

  const [housesRes, countRes] = await Promise.all([
    query(sql, params),
    query(countSql, params.slice(0, params.length - 2)),
  ]);

  res.json({ houses: housesRes.rows, total: parseInt(countRes.rows[0].count) });
});

// GET /api/housing/:id
exports.getHouse = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT h.*, u.id AS landlord_user_id, u.name AS landlord_name, u.phone AS landlord_phone,
           u.whatsapp AS landlord_whatsapp, u.avatar_url AS landlord_avatar
    FROM housing h JOIN users u ON u.id = h.landlord_id
    WHERE h.id = $1
  `, [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ message: 'Property not found.' });
  query('UPDATE housing SET views = views + 1 WHERE id = $1', [req.params.id]).catch(() => {});
  res.json({ house: result.rows[0] });
});

// POST /api/housing
exports.createHousing = asyncHandler(async (req, res) => {
  const {
    title, description, type, price, bedrooms, bathrooms,
    has_water, has_electricity, is_furnished,
    location_lat, location_lng, location_name, phone, whatsapp, available_from,
  } = req.body;

  let image_urls = [];
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map(f => uploadToCloudinary(f.buffer, 'community-smart-housing'))
    );
    image_urls = uploads.map(u => u.url);
  }

  const result = await query(`
    INSERT INTO housing (
      landlord_id, title, description, type, price, bedrooms, bathrooms,
      has_water, has_electricity, is_furnished, image_urls,
      location_lat, location_lng, location_name, phone, whatsapp, available_from
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    RETURNING *
  `, [
    req.user.id, title, description, type, price,
    bedrooms || null, bathrooms || null,
    has_water !== false, has_electricity !== false, is_furnished === true || is_furnished === 'true',
    image_urls,
    location_lat || null, location_lng || null, location_name || null,
    phone || req.user.phone, whatsapp || req.user.whatsapp,
    available_from || null,
  ]);

  res.status(201).json({ message: 'Property listed successfully!', house: result.rows[0] });
});

// PUT /api/housing/:id
exports.updateHousing = asyncHandler(async (req, res) => {
  const existing = await query('SELECT * FROM housing WHERE id = $1 AND landlord_id = $2', [req.params.id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: 'Property not found.' });
  const old = existing.rows[0];
  const { title, description, type, price, available, bedrooms, bathrooms, has_water, has_electricity } = req.body;

  const result = await query(`
    UPDATE housing SET title=$1, description=$2, type=$3, price=$4, available=$5,
      bedrooms=$6, bathrooms=$7, has_water=$8, has_electricity=$9, updated_at=NOW()
    WHERE id=$10 AND landlord_id=$11 RETURNING *
  `, [title||old.title, description||old.description, type||old.type, price||old.price,
      available!==undefined?available:old.available,
      bedrooms||old.bedrooms, bathrooms||old.bathrooms,
      has_water!==undefined?has_water:old.has_water,
      has_electricity!==undefined?has_electricity:old.has_electricity,
      req.params.id, req.user.id]);

  res.json({ message: 'Property updated.', house: result.rows[0] });
});

// DELETE /api/housing/:id
exports.deleteHousing = asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM housing WHERE id=$1 AND landlord_id=$2 RETURNING id', [req.params.id, req.user.id]);
  if (!result.rows.length) return res.status(404).json({ message: 'Property not found.' });
  res.json({ message: 'Property removed.' });
});
