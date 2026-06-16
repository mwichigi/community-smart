const { log } = require('../utils/logger');
const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// GET /api/listings
exports.getListings = asyncHandler(async (req, res) => {
  const {
    search = '', category = '', subcategory = '',
    sort = 'newest', page = 1, limit = 12,
    min_price, max_price, delivery, lat, lng, radius_km = 50,
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const params = [];
  const conditions = ['l.is_active = TRUE'];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(l.title ILIKE $${params.length} OR l.description ILIKE $${params.length} OR l.subcategory ILIKE $${params.length})`);
  }
  if (category) { params.push(category); conditions.push(`l.category = $${params.length}`); }
  if (subcategory) { params.push(subcategory); conditions.push(`l.subcategory = $${params.length}`); }
  if (min_price) { params.push(min_price); conditions.push(`l.price >= $${params.length}`); }
  if (max_price) { params.push(max_price); conditions.push(`l.price <= $${params.length}`); }
  if (delivery === 'true') conditions.push('l.delivery_available = TRUE');

  // Geo-distance filter (Haversine approximation in SQL)
  let distanceSelect = '';
  if (lat && lng) {
    params.push(parseFloat(lat), parseFloat(lng));
    const latI = params.length - 1;
    const lngI = params.length;
    distanceSelect = `, ROUND((6371 * acos(
      cos(radians($${latI})) * cos(radians(l.location_lat)) *
      cos(radians(l.location_lng) - radians($${lngI})) +
      sin(radians($${latI})) * sin(radians(l.location_lat))
    ))::numeric, 1) AS distance_km`;
    conditions.push(`l.location_lat IS NOT NULL`);
  }

  const where = conditions.join(' AND ');
  const orderMap = {
    newest:     'l.created_at DESC',
    price_asc:  'l.price ASC NULLS LAST',
    price_desc: 'l.price DESC NULLS LAST',
    nearest:    lat && lng ? 'distance_km ASC' : 'l.created_at DESC',
  };
  const orderBy = orderMap[sort] || 'l.created_at DESC';

  params.push(parseInt(limit), offset);
  const limitI = params.length - 1;
  const offsetI = params.length;

  const sql = `
    SELECT
      l.id, l.uuid, l.title, l.description, l.category, l.subcategory,
      l.price, l.unit, l.quantity, l.quantity_available, l.delivery_available,
      l.image_url, l.location_lat, l.location_lng, l.location_name,
      l.phone, l.whatsapp, l.views, l.created_at,
      u.id AS seller_id, u.name AS seller_name, u.user_type AS seller_type,
      u.avatar_url AS seller_avatar
      ${distanceSelect}
    FROM listings l
    JOIN users u ON u.id = l.seller_id
    WHERE ${where}
    ORDER BY ${orderBy}
    LIMIT $${limitI} OFFSET $${offsetI}
  `;

  const countSql = `
    SELECT COUNT(*) FROM listings l JOIN users u ON u.id = l.seller_id WHERE ${where}
  `;

  const [listingsRes, countRes] = await Promise.all([
    query(sql, params),
    query(countSql, params.slice(0, params.length - 2)),
  ]);

  res.json({
    listings: listingsRes.rows,
    total: parseInt(countRes.rows[0].count),
    page: parseInt(page),
    pages: Math.ceil(parseInt(countRes.rows[0].count) / parseInt(limit)),
  });
});

// GET /api/listings/my
exports.getMyListings = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT l.*, u.name AS seller_name
    FROM listings l JOIN users u ON u.id = l.seller_id
    WHERE l.seller_id = $1
    ORDER BY l.created_at DESC
  `, [req.user.id]);
  res.json({ listings: result.rows });
});

// GET /api/listings/:id
exports.getListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await query(`
    SELECT l.*, u.id AS seller_id, u.name AS seller_name, u.phone AS seller_phone,
           u.whatsapp AS seller_whatsapp, u.user_type AS seller_type, u.avatar_url AS seller_avatar,
           u.location_name AS seller_location
    FROM listings l JOIN users u ON u.id = l.seller_id
    WHERE l.id = $1 AND l.is_active = TRUE
  `, [id]);

  if (!result.rows.length) return res.status(404).json({ message: 'Listing not found.' });

  // Increment views (fire and forget)
  query('UPDATE listings SET views = views + 1 WHERE id = $1', [id]).catch(() => {});

  // Fetch similar listings
  const listing = result.rows[0];
  const similar = await query(`
    SELECT id, title, price, unit, image_url, location_name
    FROM listings
    WHERE category = $1 AND id != $2 AND is_active = TRUE
    ORDER BY created_at DESC LIMIT 4
  `, [listing.category, id]);

  res.json({ listing, similar: similar.rows });
});

// POST /api/listings
exports.createListing = asyncHandler(async (req, res) => {
  const {
    title, description, category, subcategory, price, unit, quantity,
    delivery_available, location_lat, location_lng, location_name,
    phone, whatsapp, available_from, available_until,
  } = req.body;

  // Image upload
  let image_url = null;
  let image_public_id = null;
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, 'community-smart-listings');
    image_url = uploaded.url;
    image_public_id = uploaded.public_id;
  }

  const result = await query(`
    INSERT INTO listings (
      seller_id, title, description, category, subcategory, price, unit,
      quantity, quantity_available, delivery_available, image_url, image_public_id,
      location_lat, location_lng, location_name, phone, whatsapp,
      available_from, available_until
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
    RETURNING *
  `, [
    req.user.id, title, description, category, subcategory || null,
    price || null, unit || null, quantity || null,
    delivery_available === 'true' || delivery_available === true,
    image_url, image_public_id,
    location_lat || null, location_lng || null, location_name || null,
    phone || req.user.phone, whatsapp || req.user.whatsapp || null,
    available_from || null, available_until || null,
  ]);

  res.status(201).json({ message: 'Listing created successfully!', listing: result.rows[0] });
});

// PUT /api/listings/:id
exports.updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await query('SELECT * FROM listings WHERE id = $1 AND seller_id = $2', [id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: 'Listing not found or not yours.' });

  const old = existing.rows[0];
  const {
    title, description, category, subcategory, price, unit,
    quantity, quantity_available, delivery_available,
    location_lat, location_lng, location_name, phone, whatsapp, is_active,
  } = req.body;

  let image_url = old.image_url;
  let image_public_id = old.image_public_id;
  if (req.file) {
    if (old.image_public_id) await deleteFromCloudinary(old.image_public_id);
    const uploaded = await uploadToCloudinary(req.file.buffer, 'community-smart-listings');
    image_url = uploaded.url;
    image_public_id = uploaded.public_id;
  }

  const result = await query(`
    UPDATE listings SET
      title=$1, description=$2, category=$3, subcategory=$4, price=$5, unit=$6,
      quantity=$7, quantity_available=$8, delivery_available=$9, image_url=$10,
      image_public_id=$11, location_lat=$12, location_lng=$13, location_name=$14,
      phone=$15, whatsapp=$16, is_active=$17, updated_at=NOW()
    WHERE id=$18 AND seller_id=$19
    RETURNING *
  `, [
    title || old.title, description || old.description, category || old.category,
    subcategory !== undefined ? subcategory : old.subcategory,
    price !== undefined ? price : old.price,
    unit || old.unit, quantity || old.quantity,
    quantity_available !== undefined ? quantity_available : old.quantity_available,
    delivery_available !== undefined ? delivery_available : old.delivery_available,
    image_url, image_public_id,
    location_lat || old.location_lat, location_lng || old.location_lng,
    location_name || old.location_name, phone || old.phone, whatsapp || old.whatsapp,
    is_active !== undefined ? is_active : old.is_active,
    id, req.user.id,
  ]);

  res.json({ message: 'Listing updated.', listing: result.rows[0] });
});

// DELETE /api/listings/:id
exports.deleteListing = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT image_public_id FROM listings WHERE id = $1 AND seller_id = $2',
    [req.params.id, req.user.id]
  );
  if (!result.rows.length) return res.status(404).json({ message: 'Listing not found.' });
  if (result.rows[0].image_public_id) await deleteFromCloudinary(result.rows[0].image_public_id);
  await query('DELETE FROM listings WHERE id = $1', [req.params.id]);
  res.json({ message: 'Listing deleted.' });
});

// PUT /api/listings/:id/mark-sold
exports.markSold = async (req, res) => {
  try {
    const result = await query(
      `UPDATE listings SET is_sold = TRUE, is_active = FALSE, sold_at = NOW() 
       WHERE id = $1 AND seller_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Listing not found or not yours.' });
    await log(req, 'mark_sold', 'listing', parseInt(req.params.id), 'Listing marked as sold');
  await log(req, 'mark_sold', 'listing', parseInt(req.params.id), 'Listing marked as sold');
  res.json({ message: 'Marked as sold!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
