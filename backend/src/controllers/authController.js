const { log } = require('../utils/logger');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

const formatUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  whatsapp: u.whatsapp,
  user_type: u.user_type,
  avatar_url: u.avatar_url,
  location_lat: u.location_lat,
  location_lng: u.location_lng,
  location_name: u.location_name,
  is_verified: u.is_verified,
  created_at: u.created_at,
});

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, whatsapp, password, user_type } = req.body;

  // Check duplicate email
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const result = await query(`
    INSERT INTO users (name, email, phone, whatsapp, password_hash, user_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, phone, whatsapp, user_type, avatar_url, is_verified, created_at
  `, [name.trim(), email.toLowerCase().trim(), phone.trim(), whatsapp?.trim() || null, password_hash, user_type || 'general']);

  const user = result.rows[0];
  const token = signToken(user.id);

  res.status(201).json({
    message: 'Account created successfully! Welcome to Community Smart.',
    token,
    user: formatUser(user),
  });
  await log(Object.assign(req, { user: formatUser(user) }), 'register', 'user', user.id, 'New user registered');
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
    [email.toLowerCase().trim()]
  );
  const user = result.rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

  // Update last_seen
  await query('UPDATE users SET last_seen = NOW() WHERE id = $1', [user.id]);

  const token = signToken(user.id);
  const userResponse = formatUser(user);
  await log(Object.assign(req, { user: userResponse }), 'login', 'user', user.id, 'User logged in');
  res.json({
    message: `Welcome back, ${user.name}!`,
    token,
    user: formatUser(user),
  });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const result = await query(
    'SELECT id, name, email, phone, whatsapp, user_type, avatar_url, bio, location_lat, location_lng, location_name, is_verified, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  res.json({ user: formatUser(result.rows[0]) });
});

// PUT /api/auth/update-profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, whatsapp, bio, location_lat, location_lng, location_name } = req.body;
  const result = await query(`
    UPDATE users SET name=$1, phone=$2, whatsapp=$3, bio=$4, location_lat=$5, location_lng=$6, location_name=$7, updated_at=NOW()
    WHERE id=$8
    RETURNING id, name, email, phone, whatsapp, user_type, bio, avatar_url, location_lat, location_lng, location_name, is_verified, created_at
  `, [name, phone, whatsapp, bio, location_lat, location_lng, location_name, req.user.id]);
  res.json({ message: 'Profile updated.', user: formatUser(result.rows[0]) });
});

// POST /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
  const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
  if (!valid) return res.status(401).json({ message: 'Current password is incorrect.' });
  const hash = await bcrypt.hash(new_password, 12);
  await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
  res.json({ message: 'Password changed successfully.' });
});
