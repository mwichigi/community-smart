const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary } = require('../config/cloudinary');

// GET /api/services
exports.getServices = asyncHandler(async (req, res) => {
  const { type, search, page = 1, limit = 20, lat, lng } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = ['TRUE'];
  const conditions = [`s.is_active = $1`];

  if (type) { params.push(type); conditions.push(`s.type = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(s.name ILIKE $${params.length} OR s.description ILIKE $${params.length})`);
  }

  let distanceSelect = '';
  if (lat && lng) {
    params.push(parseFloat(lat), parseFloat(lng));
    const latI = params.length - 1;
    const lngI = params.length;
    distanceSelect = `, ROUND((6371 * acos(GREATEST(-1, LEAST(1,
      cos(radians($${latI})) * cos(radians(s.location_lat)) *
      cos(radians(s.location_lng) - radians($${lngI})) +
      sin(radians($${latI})) * sin(radians(s.location_lat))
    ))))::numeric, 1) AS distance_km`;
  }

  const where = conditions.join(' AND ');
  params.push(parseInt(limit), offset);

  const result = await query(`
    SELECT s.*, u.name AS provider_name, u.avatar_url AS provider_avatar
    ${distanceSelect}
    FROM services s JOIN users u ON u.id = s.provider_id
    WHERE ${where}
    ORDER BY s.created_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params);

  res.json({ services: result.rows, total: result.rows.length });
});

// GET /api/services/:id
exports.getService = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT s.*, u.name AS provider_name, u.phone AS provider_phone,
           u.whatsapp AS provider_whatsapp, u.avatar_url AS provider_avatar
    FROM services s JOIN users u ON u.id = s.provider_id
    WHERE s.id = $1 AND s.is_active = TRUE
  `, [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ message: 'Service not found.' });
  query('UPDATE services SET views = views + 1 WHERE id = $1', [req.params.id]).catch(() => {});
  res.json({ service: result.rows[0] });
});

// POST /api/services
exports.createService = asyncHandler(async (req, res) => {
  const {
    name, description, type, tags, price_from, price_to, price_unit,
    operating_hours, phone, whatsapp, location_lat, location_lng, location_name, service_radius,
  } = req.body;

  let image_url = null;
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, 'community-smart-services');
    image_url = uploaded.url;
  }

  const tagsArr = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags || [];

  const result = await query(`
    INSERT INTO services (
      provider_id, name, description, type, tags, price_from, price_to, price_unit,
      operating_hours, phone, whatsapp, location_lat, location_lng, location_name, service_radius, image_url
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    RETURNING *
  `, [
    req.user.id, name, description, type, tagsArr,
    price_from || null, price_to || null, price_unit || null,
    operating_hours || null, phone || req.user.phone, whatsapp || req.user.whatsapp,
    location_lat || null, location_lng || null, location_name || null,
    service_radius || null, image_url,
  ]);

  res.status(201).json({ message: 'Service listed successfully!', service: result.rows[0] });
});

// PUT /api/services/:id
exports.updateService = asyncHandler(async (req, res) => {
  const existing = await query('SELECT * FROM services WHERE id=$1 AND provider_id=$2', [req.params.id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: 'Service not found.' });
  const old = existing.rows[0];
  const { name, description, type, operating_hours, is_active } = req.body;

  const result = await query(`
    UPDATE services SET name=$1, description=$2, type=$3, operating_hours=$4, is_active=$5, updated_at=NOW()
    WHERE id=$6 AND provider_id=$7 RETURNING *
  `, [name||old.name, description||old.description, type||old.type,
      operating_hours||old.operating_hours,
      is_active!==undefined?is_active:old.is_active,
      req.params.id, req.user.id]);

  res.json({ message: 'Service updated.', service: result.rows[0] });
});

// DELETE /api/services/:id
exports.deleteService = asyncHandler(async (req, res) => {
  const result = await query('DELETE FROM services WHERE id=$1 AND provider_id=$2 RETURNING id', [req.params.id, req.user.id]);
  if (!result.rows.length) return res.status(404).json({ message: 'Service not found.' });
  res.json({ message: 'Service removed.' });
});
