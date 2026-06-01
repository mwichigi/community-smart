require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding Community Smart database...\n');
    await client.query('BEGIN');

    // ── USERS ──────────────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash('demo123', 10);
    const users = [
      { name: 'Grace Wanjiru', email: 'farmer@demo.com', phone: '0712345678', whatsapp: '0712345678', type: 'farmer', lat: -0.4920, lng: 36.5080, loc: 'Community Smart Village' },
      { name: 'Peter Kamau',   email: 'buyer@demo.com',  phone: '0722111222', whatsapp: '0722111222', type: 'buyer',  lat: -0.5100, lng: 36.4900, loc: 'Ol Kalou Town' },
      { name: 'Mary Wathimu',  email: 'agrovet@demo.com',phone: '0731222333', whatsapp: '0731222333', type: 'agrovet',lat: -0.4910, lng: 36.5090, loc: 'Community Smart Main Rd' },
      { name: 'Dr. Samuel Kimani', email: 'vet@demo.com',phone: '0720111222', whatsapp: '0720111222', type: 'vet',   lat: -0.4940, lng: 36.5070, loc: 'Community Smart Centre' },
      { name: 'James Kariuki', email: 'landlord@demo.com',phone: '0711222333', whatsapp: '0711222333',type: 'landlord',lat:-0.4920, lng:36.5080, loc: 'Community Smart Centre' },
      { name: 'Ann Wangui',    email: 'ann@demo.com',    phone: '0766555666', whatsapp: '0766555666', type: 'farmer', lat: -0.5080, lng: 36.5020, loc: 'Community Smart' },
      { name: 'John Mwangi',   email: 'john@demo.com',   phone: '0733222333', whatsapp: '0733222333', type: 'farmer', lat: -0.4950, lng: 36.5050, loc: 'Community Smart' },
      { name: 'Alice Muthoni', email: 'alice@demo.com',  phone: '0744555666', whatsapp: '0744555666', type: 'retailer',lat:-0.4880,lng:36.5120, loc: 'Community Smart Mkt' },
    ];

    const userIds = [];
    for (const u of users) {
      const res = await client.query(`
        INSERT INTO users (name, email, phone, whatsapp, password_hash, user_type, location_lat, location_lng, location_name, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [u.name, u.email, u.phone, u.whatsapp, passwordHash, u.type, u.lat, u.lng, u.loc]);
      userIds.push(res.rows[0].id);
    }
    console.log(`✓ ${userIds.length} users seeded`);

    // ── LISTINGS ───────────────────────────────────────────────────────────────
    const listings = [
      { seller: 0, title: 'Fresh Chicken Eggs — Layers', category: 'produce', subcategory: 'Eggs', price: 450, unit: 'Tray', qty: 3, desc: 'Fresh eggs from free-range layers, collected every morning. Available 3 trays daily. Can deliver within 5km.', lat: -0.492, lng: 36.508, loc: 'Community Smart Village', phone: '0712345678', wa: '0712345678', delivery: true },
      { seller: 6, title: 'Fresh Raw Milk — Morning Collection', category: 'produce', subcategory: 'Milk', price: 55, unit: 'Litre', qty: 30, desc: 'Fresh raw milk from 4 healthy Friesian cows. Available 5–7am daily. Bring your own container.', lat: -0.495, lng: 36.505, loc: 'Community Smart', phone: '0733222333', wa: '0733222333', delivery: false },
      { seller: 0, title: 'Irish Potato (Waru) — Grade A', category: 'produce', subcategory: 'Irish Potato (Waru)', price: 2800, unit: 'Bag (90kg)', qty: 15, desc: 'Clean, large-sized waru. Good for market and household. Harvested this week. Can deliver to Ol Kalou — buyer pays transport.', lat: -0.490, lng: 36.510, loc: 'Community Smart', phone: '0712345678', wa: '0712345678', delivery: true },
      { seller: 5, title: 'Broiler Chickens (Live) — 6 Weeks', category: 'produce', subcategory: 'Poultry (Live)', price: 650, unit: 'Pieces', qty: 40, desc: 'Ready-for-market broilers, average 2.5kg live weight. Healthy flock, vaccinated. Minimum purchase 5 birds.', lat: -0.508, lng: 36.502, loc: 'Community Smart', phone: '0766555666', wa: '0766555666', delivery: false },
      { seller: 6, title: 'Green Maize (Mahindi Mabichi)', category: 'produce', subcategory: 'Maize', price: 25, unit: 'Pieces', qty: 200, desc: 'Sweet green maize for boiling. Sold per cob. Wholesalers welcome — good price for bulk.', lat: -0.505, lng: 36.495, loc: 'Community Smart', phone: '0733222333', wa: null, delivery: false },
      { seller: 0, title: 'Dry Beans — Mwitemania', category: 'produce', subcategory: 'Beans', price: 130, unit: 'Kgs', qty: 50, desc: 'Dry mwitemania beans, well cleaned. Ideal for shops and home use. Minimum 5kg.', lat: -0.488, lng: 36.512, loc: 'Community Smart', phone: '0712345678', wa: '0712345678', delivery: true },
      { seller: 5, title: 'Fresh Peas (Minji) — Shelled', category: 'produce', subcategory: 'Peas (Minji)', price: 80, unit: 'Kgs', qty: 20, desc: 'Fresh peas, already shelled. Sweet and tender. Available Tue, Thu, Sat.', lat: -0.502, lng: 36.498, loc: 'Community Smart', phone: '0766555666', wa: '0766555666', delivery: false },
      { seller: 0, title: 'Kales (Sukuma Wiki) — Bundle', category: 'produce', subcategory: 'Vegetables', price: 15, unit: 'Bundles', qty: 50, desc: 'Fresh kales harvested daily. Sold in bundles. Good for shops and market vendors.', lat: -0.493, lng: 36.507, loc: 'Community Smart', phone: '0712345678', wa: '0712345678', delivery: false },
      // Agrovet supplies
      { seller: 2, title: 'DAP Fertilizer (50kg Bag)', category: 'agrovet', subcategory: 'Fertilizers', price: 3800, unit: 'Bag (50kg)', qty: 20, desc: 'Genuine DAP fertilizer for planting. Also have CAN and NPK. Delivery available within 10km.', lat: -0.491, lng: 36.509, loc: 'Community Smart Main Rd', phone: '0731222333', wa: '0731222333', delivery: true },
      { seller: 2, title: 'Ridomil Gold — Potato Blight Control', category: 'agrovet', subcategory: 'Pesticides', price: 1200, unit: 'Pieces', qty: 30, desc: 'Ridomil Gold 68WP for late blight on potatoes. Very effective. Also have Dithane M-45.', lat: -0.491, lng: 36.509, loc: 'Community Smart Main Rd', phone: '0731222333', wa: '0731222333', delivery: false },
      { seller: 2, title: 'Dairy Meal — Ndume Feeds (70kg)', category: 'agrovet', subcategory: 'Animal Feeds', price: 2600, unit: 'Bag (70kg)', qty: 10, desc: 'High-quality dairy meal for better milk production. Also stock pig meal, layer mash and broiler starter.', lat: -0.491, lng: 36.509, loc: 'Community Smart Main Rd', phone: '0731222333', wa: '0731222333', delivery: true },
    ];

    for (const l of listings) {
      await client.query(`
        INSERT INTO listings (seller_id, title, description, category, subcategory, price, unit, quantity, quantity_available, delivery_available, location_lat, location_lng, location_name, phone, whatsapp)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$10,$11,$12,$13,$14)
      `, [userIds[l.seller], l.title, l.desc, l.category, l.subcategory, l.price, l.unit, l.qty, l.delivery, l.lat, l.lng, l.loc, l.phone, l.wa]);
    }
    console.log(`✓ ${listings.length} listings seeded`);

    // ── HOUSING ────────────────────────────────────────────────────────────────
    const houses = [
      { landlord: 4, title: 'Spacious Bedsitter near Community Smart', type: 'Bedsitter', price: 3500, desc: 'Self-contained bedsitter with water and electricity. Secure compound with perimeter wall. Close to market, school and church.', lat: -0.492, lng: 36.508, loc: 'Community Smart Centre', phone: '0711222333', wa: '0711222333', water: true, elec: true, furnished: false },
      { landlord: 4, title: '2 Bedroom House with Small Garden', type: '2 Bedrooms', price: 7500, desc: 'Permanent house with iron sheet roof, 2 bedrooms, separate kitchen, borehole water. Small garden space available. Family-friendly neighbourhood.', lat: -0.503, lng: 36.497, loc: 'Community Smart', phone: '0711222333', wa: '0711222333', water: true, elec: true, furnished: false },
      { landlord: 7, title: 'Single Room — Near Posho Mill', type: 'Single Room', price: 1800, desc: 'Clean simple room with shared bathroom. Suitable for single person or couple. Near posho mill and primary school.', lat: -0.498, lng: 36.502, loc: 'Community Smart', phone: '0744555666', wa: null, water: true, elec: false, furnished: false },
      { landlord: 7, title: 'Shop Space — Main Road, High Footfall', type: 'Shop/Commercial', price: 5000, desc: 'Ground floor shop along the Community Smart-Ol Kalou main road. Good visibility. Suitable for agrovet, hardware, general shop or M-Pesa.', lat: -0.488, lng: 36.512, loc: 'Community Smart Main Rd', phone: '0744555666', wa: '0744555666', water: true, elec: true, furnished: false },
    ];

    for (const h of houses) {
      await client.query(`
        INSERT INTO housing (landlord_id, title, description, type, price, has_water, has_electricity, is_furnished, location_lat, location_lng, location_name, phone, whatsapp)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `, [userIds[h.landlord], h.title, h.desc, h.type, h.price, h.water, h.elec, h.furnished, h.lat, h.lng, h.loc, h.phone, h.wa]);
    }
    console.log(`✓ ${houses.length} housing listings seeded`);

    // ── SERVICES ───────────────────────────────────────────────────────────────
    const services = [
      { provider: 3, name: 'Dr. Samuel Kimani — Mobile Vet Services', type: 'vet', desc: 'Experienced vet with 10+ years in Nyandarua. Services: dairy cow AI (artificial insemination), pregnancy diagnosis, deworming, vaccination, mastitis treatment, sheep, pig and poultry health.', tags: ['Dairy Cows', 'Artificial Insemination', 'Pigs', 'Sheep', 'Poultry', 'Vaccination'], hours: 'Mon–Sat 6am–7pm', lat: -0.494, lng: 36.507, loc: 'Community Smart Centre', phone: '0720111222', wa: '0720111222' },
      { provider: 2, name: 'Community Smart Agrovet & Farm Supplies', type: 'agrovet', desc: 'Full agrovet shop with: fertilizers (CAN, DAP, NPK, CAN+), certified seeds (maize, beans, peas, kale), all pesticides and herbicides, animal feeds, veterinary drugs and supplements. Agronomist advice available.', tags: ['Fertilizers', 'Seeds', 'Pesticides', 'Herbicides', 'Animal Feeds', 'Vet Drugs'], hours: 'Daily 6:30am–7pm', lat: -0.491, lng: 36.509, loc: 'Community Smart Main Rd', phone: '0731222333', wa: '0731222333' },
      { provider: 1, name: 'Kamau Pickup — Farm Produce Transport', type: 'transport', desc: 'Toyota Hilux pickup available for hire. Transports farm produce to Ol Kalou, Naivasha, Nakuru and Nyahururu markets. Available from 4am for early morning market runs. Negotiable rates for regular customers.', tags: ['Ol Kalou', 'Naivasha', 'Nakuru', 'Nyahururu', 'Early Morning'], hours: 'Daily from 4am — Call ahead', lat: -0.499, lng: 36.501, loc: 'Community Smart', phone: '0722111222', wa: '0722111222' },
      { provider: 5, name: 'Wangui Tractor — Ploughing & Harrowing', type: 'tractor', desc: 'Tractor available for ploughing, harrowing and planting. KES 3,500 per acre for ploughing. Serves Community Smart, Shamata and surrounding areas. Book 3 days ahead during planting season.', tags: ['Ploughing', 'Harrowing', 'Planting', 'Community Smart', 'Shamata'], hours: 'Seasonal — Book in advance', lat: -0.506, lng: 36.493, loc: 'Community Smart', phone: '0766555666', wa: '0766555666' },
    ];

    for (const s of services) {
      await client.query(`
        INSERT INTO services (provider_id, name, description, type, tags, operating_hours, location_lat, location_lng, location_name, phone, whatsapp)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `, [userIds[s.provider], s.name, s.desc, s.type, s.tags, s.hours, s.lat, s.lng, s.loc, s.phone, s.wa]);
    }
    console.log(`✓ ${services.length} services seeded`);

    // ── DEMO MESSAGES ──────────────────────────────────────────────────────────
    const msgs = [
      [userIds[1], userIds[0], 'Hello Grace, I saw your eggs listing. Are 3 trays still available?'],
      [userIds[0], userIds[1], 'Yes Peter, still available! Come before 8am for the freshest ones.'],
      [userIds[1], userIds[0], 'Perfect. Can I come tomorrow at 7am?'],
      [userIds[0], userIds[1], 'Yes sure. My place is near the chief\'s camp — I\'ll send you the pin.'],
    ];

    for (const [sender, receiver, text] of msgs) {
      await client.query(
        'INSERT INTO messages (sender_id, receiver_id, text) VALUES ($1, $2, $3)',
        [sender, receiver, text]
      );
    }
    console.log(`✓ ${msgs.length} demo messages seeded`);

    await client.query('COMMIT');
    console.log('\n🎉 Seed complete! Demo login credentials:');
    console.log('   Farmer:   farmer@demo.com  / demo123');
    console.log('   Buyer:    buyer@demo.com   / demo123');
    console.log('   Agrovet:  agrovet@demo.com / demo123');
    console.log('   Vet:      vet@demo.com     / demo123');
    console.log('   Landlord: landlord@demo.com/ demo123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
