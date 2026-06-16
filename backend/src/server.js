require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const {
  authRouter, listingsRouter, housingRouter,
  servicesRouter, messagesRouter, aiRouter, uploadRouter, adminRouter,
} = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    /\.vercel\.app$/,
    /\.netlify\.app$/,
    /\.workers\.dev$/,
    'https://community-smart.ngangamj828.workers.dev',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve local uploads as static files (fallback when Cloudinary not configured)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  message: { message: 'Too many requests from this IP. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts. Please wait 15 minutes.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: 'Too many AI requests. Please wait a moment.' },
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai', aiLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Community Smart API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: '🌽 Community Smart API — Nyandarua County, Kenya',
    version: '1.0.0',
    endpoints: {
      auth:     '/api/auth',
      listings: '/api/listings',
      housing:  '/api/housing',
      services: '/api/services',
      messages: '/api/messages',
      ai:       '/api/ai',
      upload:   '/api/upload',
    },
    docs: 'See README.md for full API documentation',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/housing',  housingRouter);
app.use('/api/services', servicesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/ai',       aiRouter);
app.use('/api/upload',   uploadRouter);
app.use('/api/admin',    adminRouter);

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        🌽  MAWINGU MARKET API  🌽             ║');
  console.log('║      Nyandarua County, Kenya                 ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Server:  http://localhost:${PORT}              ║`);
  console.log(`║  Health:  http://localhost:${PORT}/health        ║`);
  console.log(`║  Mode:    ${(process.env.NODE_ENV || 'development').padEnd(35)}║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log('  API Endpoints:');
  console.log(`  POST /api/auth/register`);
  console.log(`  POST /api/auth/login`);
  console.log(`  GET  /api/listings`);
  console.log(`  GET  /api/housing`);
  console.log(`  GET  /api/services`);
  console.log(`  POST /api/ai/diagnose`);
  console.log(`  GET  /api/messages/conversations`);
  console.log('');
});

module.exports = app;

