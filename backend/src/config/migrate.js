require('dotenv').config();
const { pool } = require('./db');

const SCHEMA = `
-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  uuid          UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(200) UNIQUE NOT NULL,
  phone         VARCHAR(20) NOT NULL,
  whatsapp      VARCHAR(20),
  password_hash VARCHAR(200) NOT NULL,
  user_type     VARCHAR(30) NOT NULL DEFAULT 'general',
  -- farmer | buyer | retailer | wholesaler | agrovet | vet | landlord | general
  avatar_url    TEXT,
  bio           TEXT,
  location_lat  NUMERIC(10, 7),
  location_lng  NUMERIC(10, 7),
  location_name VARCHAR(200),
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  last_seen     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── LISTINGS (Farm Produce + Agrovet Supplies) ────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id                  SERIAL PRIMARY KEY,
  uuid                UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  seller_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title               VARCHAR(200) NOT NULL,
  description         TEXT NOT NULL,
  category            VARCHAR(50) NOT NULL,
  -- produce | agrovet | services
  subcategory         VARCHAR(100),
  price               NUMERIC(12, 2),
  -- NULL = negotiable
  unit                VARCHAR(50),
  -- Kgs, Litres, Trays, Bags, etc.
  quantity            NUMERIC(10, 2),
  quantity_available  NUMERIC(10, 2),
  -- updated as stock depletes
  delivery_available  BOOLEAN DEFAULT FALSE,
  image_url           TEXT,
  image_public_id     TEXT,
  -- Cloudinary public ID for deletion
  location_lat        NUMERIC(10, 7),
  location_lng        NUMERIC(10, 7),
  location_name       VARCHAR(200),
  phone               VARCHAR(20),
  whatsapp            VARCHAR(20),
  available_from      DATE,
  available_until     DATE,
  is_active           BOOLEAN DEFAULT TRUE,
  views               INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── HOUSING LISTINGS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS housing (
  id              SERIAL PRIMARY KEY,
  uuid            UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  landlord_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     TEXT NOT NULL,
  type            VARCHAR(50) NOT NULL,
  -- Single Room | Bedsitter | 1 Bedroom | 2 Bedrooms | 3+ Bedrooms | Shop
  price           NUMERIC(10, 2) NOT NULL,
  -- monthly rent
  bedrooms        INTEGER,
  bathrooms       INTEGER,
  has_water       BOOLEAN DEFAULT TRUE,
  has_electricity BOOLEAN DEFAULT TRUE,
  is_furnished    BOOLEAN DEFAULT FALSE,
  image_urls      TEXT[],
  -- Array of image URLs
  location_lat    NUMERIC(10, 7),
  location_lng    NUMERIC(10, 7),
  location_name   VARCHAR(200),
  phone           VARCHAR(20),
  whatsapp        VARCHAR(20),
  available       BOOLEAN DEFAULT TRUE,
  available_from  DATE,
  views           INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── SERVICE PROVIDERS (Vets, Agrovets, Transport) ─────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id               SERIAL PRIMARY KEY,
  uuid             UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  provider_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(200) NOT NULL,
  description      TEXT NOT NULL,
  type             VARCHAR(50) NOT NULL,
  -- vet | agrovet | transport | tractor | labour | other
  tags             TEXT[],
  price_from       NUMERIC(10, 2),
  price_to         NUMERIC(10, 2),
  price_unit       VARCHAR(50),
  -- per call, per acre, per trip
  operating_hours  VARCHAR(200),
  phone            VARCHAR(20),
  whatsapp         VARCHAR(20),
  location_lat     NUMERIC(10, 7),
  location_lng     NUMERIC(10, 7),
  location_name    VARCHAR(200),
  service_radius   INTEGER,
  -- km radius they serve
  image_url        TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  views            INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── MESSAGES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  listing_id  INTEGER REFERENCES listings(id) ON DELETE SET NULL,
  housing_id  INTEGER REFERENCES housing(id) ON DELETE SET NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI DIAGNOSIS LOGS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_diagnoses (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  crop_type     VARCHAR(100),
  image_url     TEXT,
  disease       VARCHAR(200),
  confidence    NUMERIC(5, 2),
  severity      VARCHAR(50),
  raw_response  JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── REVIEWS / RATINGS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  INTEGER REFERENCES listings(id) ON DELETE SET NULL,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (reviewer_id, listing_id)
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_listings_seller       ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category     ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_active       ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_location     ON listings(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_listings_created      ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_housing_landlord      ON housing(landlord_id);
CREATE INDEX IF NOT EXISTS idx_housing_type          ON housing(type);
CREATE INDEX IF NOT EXISTS idx_housing_available     ON housing(available);
CREATE INDEX IF NOT EXISTS idx_services_provider     ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_type         ON services(type);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver     ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created      ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type            ON users(user_type);

-- ── UPDATED_AT TRIGGER ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_housing_updated  BEFORE UPDATE ON housing  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running database migrations...');
    await client.query(SCHEMA);
    console.log('✅ Database schema created/updated successfully!');
    console.log('\nTables created:');
    console.log('  ✓ users');
    console.log('  ✓ listings');
    console.log('  ✓ housing');
    console.log('  ✓ services');
    console.log('  ✓ messages');
    console.log('  ✓ ai_diagnoses');
    console.log('  ✓ reviews');
    console.log('\nRun "npm run db:seed" to add demo data.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    // PostGIS not available - run without it
    if (err.message.includes('postgis')) {
      console.log('⚠️  PostGIS not available — skipping geo extension (not required)');
    } else {
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

