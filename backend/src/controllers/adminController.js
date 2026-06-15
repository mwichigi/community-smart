const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

// Middleware: only allow admin users
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

// GET /api/admin/stats
exports.getStats = asyncHandler(async (req, res) => {
  const [users, listings, messages, housing, services] = await Promise.all([
    query('SELECT COUNT(*) FROM users'),
    query('SELECT COUNT(*) FROM listings WHERE is_active = TRUE'),
    query('SELECT COUNT(*) FROM messages'),
    query('SELECT COUNT(*) FROM housing WHERE available = TRUE'),
    query('SELECT COUNT(*) FROM services WHERE is_active = TRUE'),
  ]);

  const [newUsersToday, newListingsToday, recentUsers] = await Promise.all([
    query("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours'"),
    query("SELECT COUNT(*) FROM listings WHERE created_at > NOW() - INTERVAL '24 hours'"),
    query("SELECT id, name, email, user_type, created_at FROM users ORDER BY created_at DESC LIMIT 10"),
  ]);

  const categoryStats = await query(`
    SELECT category, COUNT(*) as count 
    FROM listings WHERE is_active = TRUE 
    GROUP BY category ORDER BY count DESC
  `);

  const registrationsPerDay = await query(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM users
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  res.json({
    stats: {
      totalUsers: parseInt(users.rows[0].count),
      totalListings: parseInt(listings.rows[0].count),
      totalMessages: parseInt(messages.rows[0].count),
      totalHousing: parseInt(housing.rows[0].count),
      totalServices: parseInt(services.rows[0].count),
      newUsersToday: parseInt(newUsersToday.rows[0].count),
      newListingsToday: parseInt(newListingsToday.rows[0].count),
    },
    recentUsers: recentUsers.rows,
    categoryStats: categoryStats.rows,
    registrationsPerDay: registrationsPerDay.rows,
  });
});

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const result = await query(`
    SELECT u.id, u.name, u.email, u.phone, u.user_type, u.is_active, u.is_verified, u.created_at,
      COUNT(DISTINCT l.id) as listing_count,
      COUNT(DISTINCT m.id) as message_count
    FROM users u
    LEFT JOIN listings l ON l.seller_id = u.id
    LEFT JOIN messages m ON m.sender_id = u.id
    WHERE u.name ILIKE $1 OR u.email ILIKE $1
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT $2 OFFSET $3
  `, [`%${search}%`, limit, offset]);

  const total = await query(`SELECT COUNT(*) FROM users WHERE name ILIKE $1 OR email ILIKE $1`, [`%${search}%`]);
  res.json({ users: result.rows, total: parseInt(total.rows[0].count) });
});

// GET /api/admin/listings
exports.getListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', category = '' } = req.query;
  const offset = (page - 1) * limit;
  const result = await query(`
    SELECT l.*, u.name as seller_name, u.email as seller_email, u.phone as seller_phone
    FROM listings l
    JOIN users u ON u.id = l.seller_id
    WHERE (l.title ILIKE $1 OR u.name ILIKE $1)
    AND ($2 = '' OR l.category = $2)
    ORDER BY l.created_at DESC
    LIMIT $3 OFFSET $4
  `, [`%${search}%`, category, limit, offset]);

  const total = await query(`
    SELECT COUNT(*) FROM listings l JOIN users u ON u.id = l.seller_id
    WHERE (l.title ILIKE $1 OR u.name ILIKE $1) AND ($2 = '' OR l.category = $2)
  `, [`%${search}%`, category]);

  res.json({ listings: result.rows, total: parseInt(total.rows[0].count) });
});

// DELETE /api/admin/listings/:id
exports.deleteListing = asyncHandler(async (req, res) => {
  await query('DELETE FROM listings WHERE id = $1', [req.params.id]);
  res.json({ message: 'Listing deleted successfully.' });
});

// PUT /api/admin/listings/:id/toggle
exports.toggleListing = asyncHandler(async (req, res) => {
  const result = await query(
    'UPDATE listings SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
    [req.params.id]
  );
  res.json({ is_active: result.rows[0].is_active });
});

// PUT /api/admin/users/:id/toggle
exports.toggleUser = asyncHandler(async (req, res) => {
  const result = await query(
    'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
    [req.params.id]
  );
  res.json({ is_active: result.rows[0].is_active });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  await query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ message: 'User deleted successfully.' });
});

// GET /api/admin/sold-listings
exports.getSoldListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15 } = req.query;
  const offset = (page - 1) * limit;
  const result = await query(`
    SELECT l.*, u.name as seller_name, u.email as seller_email
    FROM listings l
    JOIN users u ON u.id = l.seller_id
    WHERE l.is_sold = TRUE
    ORDER BY l.sold_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
  const total = await query(`SELECT COUNT(*) FROM listings WHERE is_sold = TRUE`);
  res.json({ listings: result.rows, total: parseInt(total.rows[0].count) });
});

// PUT /api/admin/listings/:id/mark-sold
exports.markSold = asyncHandler(async (req, res) => {
  await query(
    `UPDATE listings SET is_sold = TRUE, is_active = FALSE, sold_at = NOW() WHERE id = $1`,
    [req.params.id]
  );
  res.json({ message: 'Listing marked as sold.' });
});

// DELETE /api/admin/sold-listings
exports.deleteSoldListings = asyncHandler(async (req, res) => {
  const result = await query(`DELETE FROM listings WHERE is_sold = TRUE`);
  res.json({ message: `Deleted ${result.rowCount} sold listings.` });
});
