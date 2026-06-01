const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/messages/conversations
exports.getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const result = await query(`
    SELECT DISTINCT ON (other_user_id)
      CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS other_user_id,
      u.name AS other_user_name, u.user_type AS other_user_type, u.avatar_url AS other_user_avatar,
      m.text AS last_message_text, m.created_at AS last_message_at,
      COUNT(m2.id) FILTER (WHERE m2.receiver_id = $1 AND m2.is_read = FALSE) AS unread_count
    FROM messages m
    JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
    LEFT JOIN messages m2 ON m2.sender_id = u.id AND m2.receiver_id = $1 AND m2.is_read = FALSE
    WHERE m.sender_id = $1 OR m.receiver_id = $1
    GROUP BY other_user_id, u.name, u.user_type, u.avatar_url, m.text, m.created_at
    ORDER BY other_user_id, m.created_at DESC
  `, [userId]);

  const conversations = result.rows.map(row => ({
    id: row.other_user_id,
    other_user: {
      id: row.other_user_id,
      name: row.other_user_name,
      user_type: row.other_user_type,
      avatar_url: row.other_user_avatar,
    },
    last_message: { text: row.last_message_text, created_at: row.last_message_at },
    unread: parseInt(row.unread_count) || 0,
  }));

  res.json({ conversations });
});

// GET /api/messages/:userId
exports.getMessages = asyncHandler(async (req, res) => {
  const myId = req.user.id;
  const otherId = parseInt(req.params.userId);

  const result = await query(`
    SELECT m.*, u.name AS sender_name, u.avatar_url AS sender_avatar
    FROM messages m JOIN users u ON u.id = m.sender_id
    WHERE (m.sender_id = $1 AND m.receiver_id = $2)
       OR (m.sender_id = $2 AND m.receiver_id = $1)
    ORDER BY m.created_at ASC
    LIMIT 100
  `, [myId, otherId]);

  // Mark received messages as read
  query('UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE',
    [otherId, myId]).catch(() => {});

  res.json({ messages: result.rows });
});

// POST /api/messages
exports.sendMessage = asyncHandler(async (req, res) => {
  const { to, text, listing_id, housing_id } = req.body;
  if (!to || !text?.trim()) return res.status(400).json({ message: 'Recipient and message text are required.' });
  if (parseInt(to) === req.user.id) return res.status(400).json({ message: 'Cannot message yourself.' });

  // Check recipient exists
  const recipient = await query('SELECT id FROM users WHERE id = $1', [to]);
  if (!recipient.rows.length) return res.status(404).json({ message: 'Recipient not found.' });

  const result = await query(`
    INSERT INTO messages (sender_id, receiver_id, text, listing_id, housing_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *, (SELECT name FROM users WHERE id = $1) AS sender_name
  `, [req.user.id, to, text.trim(), listing_id || null, housing_id || null]);

  res.status(201).json({ message: result.rows[0] });
});

// PUT /api/messages/:id/read
exports.markRead = asyncHandler(async (req, res) => {
  await query('UPDATE messages SET is_read = TRUE WHERE id = $1 AND receiver_id = $2', [req.params.id, req.user.id]);
  res.json({ message: 'Marked as read.' });
});

// GET /api/messages/unread-count
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const result = await query('SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = FALSE', [req.user.id]);
  res.json({ unread: parseInt(result.rows[0].count) });
});
