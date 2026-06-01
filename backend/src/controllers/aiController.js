const axios = require('axios');
const FormData = require('form-data');
const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary } = require('../config/cloudinary');

// ── Disease Knowledge Base ─────────────────────────────────────────────────────
// Fallback when no API keys are configured (offline-capable)
const DISEASE_KB = {
  'late blight': {
    disease: 'Late Blight (Phytophthora infestans)',
    crop_match: ['potato', 'waru', 'irish potato', 'tomato'],
    severity: 'High',
    symptoms: [
      'Dark brown/black water-soaked lesions on leaves and stems',
      'White fuzzy sporulation on underside of leaves in humid conditions',
      'Rapid spread especially in cold, wet, foggy weather (Nyandarua climate)',
      'Brown rot in infected tubers with unpleasant smell',
    ],
    treatment: [
      'Spray Ridomil Gold 68WP (Metalaxyl + Mancozeb) immediately — 2.5g per litre of water',
      'Apply Dithane M-45 (Mancozeb) as a protective spray every 7 days',
      'Remove and destroy (burn) all infected plant material — do not compost',
      'Improve air circulation by thinning dense plantings',
      'Avoid overhead irrigation — water at base of plant only',
      'For severe infections: Acrobat MZ (Dimethomorph + Mancozeb) gives better systemic control',
    ],
    prevention: [
      'Use certified disease-free seed potato (Shangi, Dutch Robyjn, or Tigoni varieties are more resistant)',
      'Begin preventive Dithane M-45 spraying before rains start — especially Oct–Dec and Mar–May',
      'Practice crop rotation — avoid planting potatoes in same bed two seasons in a row',
      'Apply Copper-based fungicide (Copper Oxychloride) as preventive during cold/foggy weather',
    ],
    urgency: 'Act within 24–48 hours — late blight spreads extremely fast in Nyandarua cold weather',
    nearest_products: ['Ridomil Gold', 'Dithane M-45', 'Acrobat MZ', 'Copper Oxychloride'],
  },
  'early blight': {
    disease: 'Early Blight (Alternaria solani)',
    crop_match: ['potato', 'waru', 'tomato'],
    severity: 'Medium',
    symptoms: [
      'Small dark brown spots with concentric rings (target-board pattern) on older leaves',
      'Yellow area surrounding the dark lesion',
      'Lesions starting on lower/older leaves first',
      'Stem lesions cause stem canker in severe cases',
    ],
    treatment: [
      'Apply Mancozeb (Dithane M-45) — 2g per litre, spray every 7–10 days',
      'Use Chlorothalonil (Bravo) for good contact protection',
      'Remove heavily infected lower leaves and destroy (burn)',
      'Improve fertilization — early blight is worsened by nitrogen deficiency',
    ],
    prevention: [
      'Ensure adequate nutrition, especially nitrogen (top-dress with CAN during growth)',
      'Use resistant varieties',
      'Avoid water stress — consistent irrigation if no rain',
    ],
    urgency: 'Less urgent than late blight — treat within 1 week',
    nearest_products: ['Dithane M-45', 'Bravo (Chlorothalonil)', 'Copper fungicide'],
  },
  'maize lethal necrosis': {
    disease: 'Maize Lethal Necrosis (MLN)',
    crop_match: ['maize', 'corn'],
    severity: 'Very High',
    symptoms: [
      'Yellowing (chlorosis) of leaves starting from tips and edges',
      'Brown streaks and dead tissue along leaf margins',
      'Dead, bleached tassels and premature death',
      'Ears fail to develop — complete yield loss in severe cases',
      'Plants die before maturity',
    ],
    treatment: [
      'NO CURE — MLN is caused by a virus. Uproot and burn affected plants immediately',
      'Do not leave infected residue in the field — it harbours the virus',
      'Apply Lambda-cyhalothrin insecticide to control thrips and aphids (virus vectors)',
      'Report severe outbreaks to the nearest Ministry of Agriculture office in Ol Kalou',
      'Do not use seed from infected fields',
    ],
    prevention: [
      'Use certified MLN-tolerant seed varieties: Duma 43, SC403, H614D',
      'Control thrips and aphids with neem-based spray or Lambda-cyhalothrin from germination',
      'Practice crop rotation — avoid maize monoculture',
      'Remove maize crop residues after harvest',
    ],
    urgency: 'CRITICAL — Uproot infected plants immediately to prevent total field loss',
    nearest_products: ['Lambda-cyhalothrin (Karate)', 'Neem-based insecticide', 'Actara (Thiamethoxam)'],
  },
  'grey leaf spot': {
    disease: 'Grey Leaf Spot (Cercospora zeae-maydis)',
    crop_match: ['maize'],
    severity: 'Medium',
    symptoms: [
      'Long, narrow tan-to-grey rectangular lesions running parallel to leaf veins',
      'Lesions limited by leaf veins — rectangular shape is distinctive',
      'Starts on lower leaves and moves up the plant',
    ],
    treatment: [
      'Apply Mancozeb-based fungicide (Dithane M-45) — 2g per litre',
      'Spray Propiconazole (Tilt 250EC) for systemic control',
      'Ensure adequate plant spacing for air circulation',
    ],
    prevention: ['Rotate crops with non-cereals', 'Use resistant hybrids', 'Remove crop residues'],
    urgency: 'Treat within 1–2 weeks for best results',
    nearest_products: ['Dithane M-45', 'Tilt 250EC (Propiconazole)'],
  },
  'downy mildew': {
    disease: 'Downy Mildew',
    crop_match: ['cabbage', 'kale', 'sukuma', 'vegetable', 'beans'],
    severity: 'Medium',
    symptoms: [
      'Pale yellow patches on upper surface of leaves',
      'White/grey/purple fuzzy mould on underside of leaves',
      'Affected tissue turns brown and dies',
      'Worse in cool, humid conditions',
    ],
    treatment: [
      'Remove and destroy infected leaves immediately',
      'Spray Ridomil Gold or Mancozeb-based fungicide',
      'Improve air circulation around plants',
      'Reduce irrigation — avoid wet foliage',
    ],
    prevention: ['Plant in well-drained soil', 'Space plants adequately', 'Avoid overhead irrigation'],
    urgency: 'Treat within 3–5 days to prevent spread',
    nearest_products: ['Ridomil Gold', 'Dithane M-45', 'Copper Oxychloride'],
  },
  'bean rust': {
    disease: 'Bean Rust (Uromyces appendiculatus)',
    crop_match: ['beans', 'bean'],
    severity: 'Medium',
    symptoms: [
      'Small reddish-brown powdery pustules on leaves, stems and pods',
      'Yellow halo around each pustule',
      'Severe infection causes premature defoliation',
      'Pods show brown/black lesions',
    ],
    treatment: [
      'Apply Mancozeb (Dithane M-45) — 2g per litre every 7–10 days',
      'Spray Propiconazole (Tilt 250EC) for systemic control',
      'Remove and destroy heavily infected plants',
    ],
    prevention: ['Use resistant bean varieties', 'Rotate crops', 'Avoid dense planting'],
    urgency: 'Treat within 5–7 days',
    nearest_products: ['Dithane M-45', 'Tilt 250EC', 'Copper Oxychloride'],
  },
};

// Identify disease from Plant.id API response
function mapPlantIdResult(plantData, cropType) {
  const suggestions = plantData?.result?.disease?.suggestions || [];
  if (!suggestions.length) return null;

  const top = suggestions[0];
  const name = top.name?.toLowerCase() || '';

  for (const [key, info] of Object.entries(DISEASE_KB)) {
    if (name.includes(key) || key.split(' ').every(w => name.includes(w))) {
      return {
        ...info,
        confidence: Math.round((top.probability || 0.7) * 100),
        crop: cropType || 'Unknown crop',
        raw: top,
      };
    }
  }

  // Return basic info from Plant.id even if not in KB
  return {
    disease: top.name || 'Unknown Disease',
    crop: cropType || 'Unknown crop',
    confidence: Math.round((top.probability || 0.5) * 100),
    severity: 'Unknown',
    symptoms: ['Visible disease symptoms detected. Consult your local agronomist for detailed advice.'],
    treatment: ['Contact your nearest agrovet or agricultural officer in Ol Kalou for specific treatment advice.'],
    prevention: ['Maintain good crop hygiene and proper spacing.'],
    urgency: 'Consult an expert as soon as possible.',
    nearest_products: [],
  };
}

// Use Claude API as intelligent fallback
async function diagnoseWithClaude(imageBase64, cropType) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const res = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
          },
          {
            type: 'text',
            text: `You are an expert agricultural extension officer in Nyandarua County, Kenya. 
Analyze this crop image${cropType ? ` (crop: ${cropType})` : ''} and respond ONLY with a JSON object — no markdown, no explanation text.
Fields required:
{
  "disease": "disease name",
  "crop": "crop name",
  "confidence": 0-100,
  "severity": "Low|Medium|High|Very High",
  "symptoms": ["symptom 1", "symptom 2"],
  "treatment": ["step 1 with specific product name and dose", "step 2"],
  "prevention": ["prevention tip"],
  "urgency": "brief urgency note",
  "nearest_products": ["product1", "product2"]
}
Focus on diseases common in Nyandarua County highlands: potato blight, MLN, downy mildew, bean rust, grey leaf spot.
Mention specific pesticide brands available in Kenyan agrovets.`,
          },
        ],
      }],
    }, {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
    });

    const text = res.data?.content?.[0]?.text?.trim();
    if (!text) return null;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error('Claude API fallback failed:', e.message);
    return null;
  }
}

// Heuristic local fallback — match crop name to most likely disease
function localFallback(cropType) {
  const crop = (cropType || '').toLowerCase();
  if (crop.includes('potato') || crop.includes('waru')) return { ...DISEASE_KB['late blight'], crop: cropType, confidence: 65 };
  if (crop.includes('maize') || crop.includes('mahindi')) return { ...DISEASE_KB['maize lethal necrosis'], crop: cropType, confidence: 55 };
  if (crop.includes('bean')) return { ...DISEASE_KB['bean rust'], crop: cropType, confidence: 55 };
  if (crop.includes('kale') || crop.includes('sukuma') || crop.includes('cabbage')) return { ...DISEASE_KB['downy mildew'], crop: cropType, confidence: 55 };
  return {
    disease: 'Disease Detected — Analysis Required',
    crop: cropType || 'Unknown crop',
    confidence: 40,
    severity: 'Unknown',
    symptoms: ['Visible symptoms of plant disease detected in image.', 'Manual inspection recommended.'],
    treatment: ['Contact your nearest agrovet in Community Smart or Ol Kalou for diagnosis and advice.', 'Dr. Samuel Kimani (Community Smart Vet): 0720111222', 'Community Smart Agrovet: 0731222333'],
    prevention: ['Maintain good crop hygiene', 'Ensure proper plant spacing', 'Regular scouting of fields'],
    urgency: 'Visit your nearest agrovet or agricultural officer for accurate diagnosis.',
    nearest_products: [],
  };
}

// POST /api/ai/diagnose
exports.diagnose = asyncHandler(async (req, res) => {
  const { crop_type } = req.body;
  let diagnosis = null;
  let imageUrl = null;

  if (!req.file && !crop_type) {
    return res.status(400).json({ message: 'Please provide an image or crop type.' });
  }

  // Upload image
  if (req.file) {
    try {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'community-smart-ai');
      imageUrl = uploaded.url;
    } catch (e) { /* continue without image URL */ }

    // 1. Try Plant.id API
    if (process.env.PLANT_ID_API_KEY) {
      try {
        const base64 = req.file.buffer.toString('base64');
        const form = {
          api_key: process.env.PLANT_ID_API_KEY,
          images: [base64],
          modifiers: ['crops_fast'],
          disease_details: ['description', 'treatment', 'classification'],
          plant_details: ['common_names', 'scientific_name'],
        };
        const plantRes = await axios.post('https://api.plant.id/v2/identify', form, { timeout: 20000 });
        diagnosis = mapPlantIdResult(plantRes.data, crop_type);
      } catch (e) {
        console.log('Plant.id API unavailable, trying Claude fallback...');
      }
    }

    // 2. Try Claude vision fallback
    if (!diagnosis && process.env.ANTHROPIC_API_KEY) {
      try {
        const base64 = req.file.buffer.toString('base64');
        diagnosis = await diagnoseWithClaude(base64, crop_type);
      } catch (e) {
        console.log('Claude fallback failed, using local KB...');
      }
    }
  }

  // 3. Local knowledge base fallback
  if (!diagnosis) {
    diagnosis = localFallback(crop_type);
    diagnosis.note = 'For best results, ensure PLANT_ID_API_KEY is configured in .env';
  }

  // Log diagnosis
  if (req.user) {
    query(`
      INSERT INTO ai_diagnoses (user_id, crop_type, image_url, disease, confidence, severity, raw_response)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [req.user.id, crop_type || null, imageUrl, diagnosis.disease, diagnosis.confidence, diagnosis.severity, JSON.stringify(diagnosis)])
      .catch(() => {});
  }

  // Fetch nearby agrovets to attach to response
  let nearbyAgrovets = [];
  try {
    const svcs = await query(`
      SELECT id, name, phone, whatsapp, location_name
      FROM services WHERE type IN ('agrovet', 'vet') AND is_active = TRUE
      LIMIT 3
    `);
    nearbyAgrovets = svcs.rows;
  } catch { /* optional */ }

  res.json({ ...diagnosis, nearby_services: nearbyAgrovets });
});
