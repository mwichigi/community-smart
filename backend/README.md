# 🌽 Mawingu Market — Full Stack

> A centralized digital marketplace for Mawingu Village, Nyandarua County, Kenya.
> Connecting farmers, buyers, agrovets, vets, and landlords.

---

## 📁 Project Structure

```
mawingu-market/          ← React frontend
mawingu-backend/         ← Node.js + Express + PostgreSQL backend
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- (Optional) Cloudinary account — for image uploads
- (Optional) Plant.id API key — for AI crop diagnosis

---

## 🗄️ Database Setup

```bash
# 1. Create the database
psql -U postgres
CREATE DATABASE mawingu_market;
\q

# 2. Configure environment
cd mawingu-backend
cp .env.example .env
# Edit .env with your DB credentials

# 3. Run migrations
npm run db:migrate

# 4. Seed demo data
npm run db:seed
```

---

## 🖥️ Backend Setup

```bash
cd mawingu-backend
npm install
cp .env.example .env
# Edit .env — set DB credentials and API keys

npm run dev        # Development (auto-reload)
npm start          # Production
```

Backend runs on: **http://localhost:5000**

---

## 💻 Frontend Setup

```bash
cd mawingu-market
npm install

# Create .env in frontend root:
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
echo "REACT_APP_GOOGLE_MAPS_KEY=your_key_here" >> .env

npm start
```

Frontend runs on: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

| Role     | Email                | Password |
|----------|----------------------|----------|
| Farmer   | farmer@demo.com      | demo123  |
| Buyer    | buyer@demo.com       | demo123  |
| Agrovet  | agrovet@demo.com     | demo123  |
| Vet      | vet@demo.com         | demo123  |
| Landlord | landlord@demo.com    | demo123  |

---

## 📡 API Endpoints

### Auth
| Method | Route                     | Description         | Auth |
|--------|---------------------------|---------------------|------|
| POST   | /api/auth/register        | Create account      | No   |
| POST   | /api/auth/login           | Sign in             | No   |
| GET    | /api/auth/me              | Get profile         | Yes  |
| PUT    | /api/auth/profile         | Update profile      | Yes  |
| POST   | /api/auth/change-password | Change password     | Yes  |

### Listings (Farm Produce + Agrovet Supplies)
| Method | Route              | Description         | Auth |
|--------|--------------------|---------------------|------|
| GET    | /api/listings      | Get all listings    | No   |
| GET    | /api/listings/my   | My listings         | Yes  |
| GET    | /api/listings/:id  | Get one listing     | No   |
| POST   | /api/listings      | Create listing      | Yes  |
| PUT    | /api/listings/:id  | Update listing      | Yes  |
| DELETE | /api/listings/:id  | Delete listing      | Yes  |

**Query params:** `search`, `category`, `subcategory`, `sort`, `page`, `limit`, `min_price`, `max_price`, `delivery`, `lat`, `lng`

### Housing
| Method | Route            | Description        | Auth |
|--------|------------------|--------------------|------|
| GET    | /api/housing     | Get all properties | No   |
| GET    | /api/housing/:id | Get one property   | No   |
| POST   | /api/housing     | Create listing     | Yes  |
| PUT    | /api/housing/:id | Update listing     | Yes  |
| DELETE | /api/housing/:id | Delete listing     | Yes  |

### Services (Vets, Agrovets, Transport)
| Method | Route             | Description      | Auth |
|--------|-------------------|------------------|------|
| GET    | /api/services     | Get all services | No   |
| GET    | /api/services/:id | Get one service  | No   |
| POST   | /api/services     | Create service   | Yes  |
| PUT    | /api/services/:id | Update service   | Yes  |
| DELETE | /api/services/:id | Delete service   | Yes  |

### AI Crop Diagnosis
| Method | Route             | Description                     | Auth     |
|--------|-------------------|---------------------------------|----------|
| POST   | /api/ai/diagnose  | Upload image → get diagnosis    | Optional |

**Body (multipart/form-data):**
- `image` — JPEG/PNG of affected crop
- `crop_type` — e.g. "Irish Potato (Waru)", "Maize"

**AI Pipeline (in order of priority):**
1. **Plant.id API** — professional plant disease recognition
2. **Claude Vision API** — Anthropic AI with Kenya-specific agronomic knowledge
3. **Local Knowledge Base** — offline fallback for common Nyandarua diseases

### Messages
| Method | Route                         | Description           | Auth |
|--------|-------------------------------|-----------------------|------|
| GET    | /api/messages/conversations   | All conversations     | Yes  |
| GET    | /api/messages/unread          | Unread count          | Yes  |
| GET    | /api/messages/:userId         | Chat with user        | Yes  |
| POST   | /api/messages                 | Send message          | Yes  |

### Upload
| Method | Route             | Description      | Auth |
|--------|-------------------|------------------|------|
| POST   | /api/upload/image | Upload one image | Yes  |

---

## 🌿 AI Crop Disease Knowledge Base

Built-in offline diagnoses for Nyandarua County's most common crop diseases:

| Disease | Crops | Severity |
|---------|-------|----------|
| Late Blight (Phytophthora) | Irish Potato, Tomato | High |
| Early Blight (Alternaria) | Irish Potato, Tomato | Medium |
| Maize Lethal Necrosis (MLN) | Maize | Very High |
| Grey Leaf Spot | Maize | Medium |
| Downy Mildew | Kale, Cabbage, Beans | Medium |
| Bean Rust | Beans | Medium |

Each diagnosis includes: symptoms, treatment steps with specific pesticide names and doses, prevention tips, and urgency rating.

---

## 🔧 Configuration (.env)

```env
PORT=5000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mawingu_market
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=change_this_to_random_string
JWT_EXPIRES_IN=30d

# Cloudinary (image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# AI Crop Diagnosis
PLANT_ID_API_KEY=your_plantid_key
ANTHROPIC_API_KEY=your_claude_key

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## ☁️ Deployment

### Backend (Render / Railway)
1. Push to GitHub
2. Create new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all `.env` variables in dashboard
6. Add a PostgreSQL database (Render provides free tier)
7. Set `DATABASE_URL` from the DB connection string

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` to your Render backend URL
2. Deploy with `npm run build`

---

## 📱 WhatsApp Integration

Every listing includes WhatsApp click-to-chat links:
```
https://wa.me/254712345678?text=Hi%2C%20I%20saw%20your%20eggs%20listing%20on%20Mawingu%20Market
```
No API key required — uses WhatsApp's standard `wa.me` link format.

---

## 🗺️ Map Integration

Uses **Leaflet.js** + **OpenStreetMap** (no API key required):
- Location pinning when posting listings
- Map view for browsing listings by location
- Distance calculations using Haversine formula in PostgreSQL
- Centered on Mawingu Village, Nyandarua County (-0.5, 36.5)

---

Built with ❤️ for Mawingu Village Community · Nyandarua County · Kenya
