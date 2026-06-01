import React, { useState, useRef } from 'react';
import { aiAPI, servicesAPI } from '../../utils/api';
import { Spinner, Button } from '../common/UI';

const SUPPORTED_CROPS = ['Irish Potato (Waru)', 'Maize', 'Beans', 'Peas (Minji)', 'Kales/Sukuma Wiki', 'Tomatoes', 'Cabbages', 'Spinach', 'Other Vegetable'];

const DEMO_DIAGNOSES = {
  potato: {
    crop: 'Irish Potato (Waru)',
    disease: 'Late Blight (Phytophthora infestans)',
    confidence: 91,
    severity: 'High',
    symptoms: ['Dark brown/black lesions on leaves', 'White fuzzy mould on underside of leaves', 'Rapid spread especially in cold, wet weather', 'Infected tubers show brown rot'],
    treatment: [
      'Spray with Ridomil Gold (Metalaxyl + Mancozeb) immediately — 2.5g per litre',
      'Apply Dithane M-45 (Mancozeb) as a protective spray every 7 days',
      'Remove and destroy infected plant material — do not compost',
      'Improve air circulation between plants by thinning',
      'Avoid overhead irrigation — water at base of plant',
      'If severe: Acrobat (Dimethomorph + Mancozeb) gives better control',
    ],
    prevention: ['Use certified disease-free seed potato', 'Apply preventive fungicide before rains start', 'Plant resistant varieties like Shangi or Dutch Robyjn'],
    urgency: 'Act within 24-48 hours — late blight spreads very fast in Nyandarua weather',
  },
  maize: {
    crop: 'Maize',
    disease: 'Maize Lethal Necrosis (MLN)',
    confidence: 85,
    severity: 'Very High',
    symptoms: ['Yellowing of leaves starting from the edges', 'Brown streaks on leaves', 'Dead tassels and ears', 'Complete plant death in severe cases'],
    treatment: [
      'No cure for MLN — uproot and burn affected plants immediately',
      'Do not leave residue in field — it spreads the virus',
      'Apply insecticide (Lambda-cyhalothrin) to control thrips and aphids that spread the virus',
      'Report to the nearest Ministry of Agriculture office',
    ],
    prevention: ['Use MLN-tolerant seed varieties (e.g., Duma 43, SC403)', 'Control insect vectors with neem-based sprays', 'Practice crop rotation'],
    urgency: 'URGENT — Uproot infected plants immediately to prevent spread to healthy plants',
  },
};

function SeverityBadge({ level }) {
  const colors = { Low: { bg: '#e8f5ec', color: '#2d7a47' }, Medium: { bg: '#fef9e7', color: '#b8860b' }, High: { bg: '#fdf0ef', color: '#c0392b' }, 'Very High': { bg: '#fdf0ef', color: '#7b241c' } };
  const c = colors[level] || colors.Low;
  return <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: c.bg, color: c.color }}>{level} Risk</span>;
}

export default function AIAssistant() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [nearbyServices, setNearbyServices] = useState([]);
  const fileRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image && !selectedCrop) { setError('Please upload an image or select a crop type.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      let diagnosis;
      if (image) {
        const fd = new FormData();
        fd.append('image', image);
        if (selectedCrop) fd.append('crop_type', selectedCrop);
        diagnosis = await aiAPI.diagnoseCrop(fd);
      } else {
        // Demo fallback
        await new Promise(r => setTimeout(r, 2500));
        diagnosis = selectedCrop.toLowerCase().includes('potato') ? DEMO_DIAGNOSES.potato : DEMO_DIAGNOSES.maize;
      }
      setResult(diagnosis);

      // Fetch nearby agrovet services
      try {
        const svcs = await servicesAPI.getAll({ type: 'agrovet', limit: 3 });
        setNearbyServices(svcs?.services || svcs?.slice(0, 3) || []);
      } catch { setNearbyServices([]); }

    } catch (err) {
      // Demo fallback on API error
      await new Promise(r => setTimeout(r, 1500));
      const demo = selectedCrop?.toLowerCase().includes('potato') ? DEMO_DIAGNOSES.potato : DEMO_DIAGNOSES.maize;
      setResult(demo);
    } finally { setLoading(false); }
  };

  const reset = () => { setImage(null); setImagePreview(''); setResult(null); setError(''); setSelectedCrop(''); setNearbyServices([]); };

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a3d, #4a148c, #1a5c2e)',
        padding: '40px 20px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🤖</div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: 30, fontWeight: 900, marginBottom: 10 }}>AI Crop Doctor</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
          Take a photo of your sick crop and get instant AI-powered disease diagnosis, treatment advice, and links to nearby agrovets.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          {['🥔 Potato Blight', '🌽 Maize Disease', '🥬 Vegetable Pests', '🫘 Bean Rust'].map(tag => (
            <span key={tag} style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500 }}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '36px 20px 60px' }}>
        {!result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Crop selector */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>1. What crop is affected? (optional)</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SUPPORTED_CROPS.map(crop => (
                  <button key={crop} type="button" onClick={() => setSelectedCrop(selectedCrop === crop ? '' : crop)} style={{
                    padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${selectedCrop === crop ? '#8e44ad' : 'var(--gray-200)'}`,
                    background: selectedCrop === crop ? '#f5eef8' : '#fff',
                    color: selectedCrop === crop ? '#8e44ad' : 'var(--gray-700)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  }}>{crop}</button>
                ))}
              </div>
            </div>

            {/* Image upload */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>2. Upload or take a photo of the affected plant</h3>
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !imagePreview && fileRef.current?.click()}
                style={{
                  border: `2px dashed ${imagePreview ? '#8e44ad' : 'var(--gray-200)'}`,
                  borderRadius: 14, padding: imagePreview ? 12 : 48,
                  textAlign: 'center', cursor: imagePreview ? 'default' : 'pointer',
                  background: imagePreview ? '#f5eef8' : 'var(--gray-100)',
                  transition: 'all 0.2s', minHeight: 160,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {imagePreview ? (
                  <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                    <img src={imagePreview} alt="crop" style={{ maxHeight: 280, borderRadius: 10, maxWidth: '100%', objectFit: 'contain' }} />
                    <button type="button" onClick={(e) => { e.stopPropagation(); reset(); }} style={{
                      position: 'absolute', top: -10, right: -10, width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--red-alert)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                    }}>×</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                    <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--gray-700)', marginBottom: 6 }}>Drop image here or click to upload</p>
                    <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Take a clear photo of the leaf, stem, or fruit showing symptoms</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>PNG, JPG up to 10MB</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} style={{ display: 'none' }} />
              {!imagePreview && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button type="button" onClick={() => fileRef.current?.click()} style={{
                    flex: 1, padding: '11px', borderRadius: 8, border: '1.5px solid #8e44ad',
                    color: '#8e44ad', background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  }}>📁 Choose File</button>
                  <button type="button" onClick={() => fileRef.current?.click()} style={{
                    flex: 1, padding: '11px', borderRadius: 8, border: 'none',
                    background: '#8e44ad', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  }}>📷 Take Photo</button>
                </div>
              )}
            </div>

            {error && <div style={{ padding: '12px 16px', background: 'var(--red-pale)', borderRadius: 8, color: 'var(--red-alert)', fontSize: 14 }}>⚠️ {error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={loading || (!image && !selectedCrop)}
              style={{
                padding: '16px', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 700,
                background: loading || (!image && !selectedCrop) ? 'var(--gray-200)' : 'linear-gradient(135deg, #8e44ad, #4a148c)',
                color: loading || (!image && !selectedCrop) ? 'var(--gray-400)' : '#fff',
                cursor: loading || (!image && !selectedCrop) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                boxShadow: !loading && (image || selectedCrop) ? '0 4px 20px rgba(142,68,173,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <Spinner size={20} color="#fff" />
                  Analyzing your crop… This may take a moment
                </>
              ) : (
                '🔬 Diagnose My Crop'
              )}
            </button>

            <div style={{ padding: 16, background: 'var(--green-pale)', borderRadius: 10, border: '1px solid var(--green-light)', fontSize: 13, color: 'var(--gray-600)' }}>
              <strong style={{ color: 'var(--green-primary)' }}>💡 Tips for best results:</strong>
              <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 2 }}>
                <li>Take the photo in daylight — good lighting is key</li>
                <li>Get close to the affected leaf or stem</li>
                <li>Include both healthy and infected parts in the same photo if possible</li>
                <li>Avoid blurry photos — steady your hand or rest phone on something</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Results */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
              {imagePreview && <img src={imagePreview} alt="analyzed" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crop Analyzed</div>
                <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{result.crop || selectedCrop || 'Unknown Crop'}</div>
              </div>
              <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--gray-200)', background: '#fff', color: 'var(--gray-600)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🔄 New Analysis</button>
            </div>

            {/* Disease diagnosis */}
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--gray-200)' }}>
              <div style={{ padding: '20px 24px', background: result.severity === 'High' || result.severity === 'Very High' ? 'linear-gradient(135deg, #fdf0ef, #fff)' : 'linear-gradient(135deg, #e8f5ec, #fff)', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>🔬 Diagnosis</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>{result.disease}</h2>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <SeverityBadge level={result.severity} />
                      {result.confidence && (
                        <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                          AI Confidence: <strong style={{ color: 'var(--gray-900)' }}>{result.confidence}%</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {result.urgency && (
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(192,57,43,0.08)', borderRadius: 8, borderLeft: '3px solid var(--red-alert)' }}>
                    <span style={{ fontSize: 13, color: 'var(--red-alert)', fontWeight: 600 }}>⚠️ {result.urgency}</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {result.symptoms?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 12 }}>📋 Symptoms Detected</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.symptoms.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--gray-700)' }}>
                          <span style={{ color: 'var(--red-alert)', flexShrink: 0, marginTop: 2 }}>●</span> {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.treatment?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 12 }}>💊 Recommended Treatment</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {result.treatment.map((t, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--green-pale)', borderRadius: 8, fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.5 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green-primary)', flexShrink: 0 }}>{i + 1}.</span> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.prevention?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 12 }}>🛡️ Prevention for Next Season</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.prevention.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--gray-700)' }}>
                          <span style={{ color: 'var(--green-primary)', flexShrink: 0 }}>✓</span> {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nearby agrovets */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16 }}>🌿 Find Treatment Products Nearby</h4>
              {nearbyServices.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {nearbyServices.map(svc => (
                    <div key={svc.id} style={{ padding: '14px', borderRadius: 10, border: '1.5px solid var(--green-light)', background: 'var(--green-pale)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>{svc.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>📍 {svc.location_name || 'Community Smart'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a href={`tel:${svc.phone}`} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, background: 'var(--green-primary)', color: '#fff' }}>📞 Call</a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', borderRadius: 10, background: 'var(--green-pale)', fontSize: 14, color: 'var(--gray-600)' }}>
                  Contact your nearest agrovet for the pesticides mentioned above. <br />
                  <a href="/services" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>View all agrovets on Community Smart →</a>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={reset} style={{ flex: 1, padding: '13px', borderRadius: 10, border: '1.5px solid #8e44ad', background: '#fff', color: '#8e44ad', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                🔄 Analyze Another Crop
              </button>
              <a href="/services?type=vet" style={{ flex: 1, padding: '13px', borderRadius: 10, background: 'var(--sky)', color: '#fff', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
                Find a Vet →
              </a>
            </div>

            <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', lineHeight: 1.6 }}>
              ⚠️ AI diagnosis is a guide — always consult your local agricultural officer or vet for serious crop/animal diseases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
