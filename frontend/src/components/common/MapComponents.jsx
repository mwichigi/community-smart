import React, { useState, useEffect, useRef } from 'react';

const COMMUNITY = [-0.5, 36.5];

export function MapPicker({ value, onChange, height = 300 }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  const [coords, setCoords] = useState(value || null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (leafletMap.current || !mapRef.current) return;
    const L = window.L;
    if (!L) { console.error('Leaflet not loaded'); return; }
    const map = L.map(mapRef.current).setView(coords ? [coords.lat, coords.lng] : COMMUNITY, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (coords) {
      markerRef.current = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', e => {
        const pos = e.target.getLatLng();
        const c = { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) };
        setCoords(c); onChange && onChange(c);
      });
    }

    map.on('click', e => {
      const c = { lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) };
      if (markerRef.current) {
        markerRef.current.setLatLng([c.lat, c.lng]);
      } else {
        markerRef.current = L.marker([c.lat, c.lng], { draggable: true }).addTo(map);
      }
      setCoords(c); onChange && onChange(c);
    });

    leafletMap.current = map;
  }, []);

  const locateMe = () => {
    setLocating(true);
      alert('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      const c = { lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) };
      if (!leafletMap.current) { setLocating(false); return; }
      const L = window.L;
      if (!L) { setLocating(false); return; }
      leafletMap.current.setView([c.lat, c.lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([c.lat, c.lng]);
      } else {
        markerRef.current = L.marker([c.lat, c.lng], { draggable: true }).addTo(leafletMap.current);
      }
      setCoords(c); onChange && onChange(c);
      setLocating(false);
    }, (err) => { alert('Could not get your location. Please click on the map instead.'); setLocating(false); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
        <button type="button" onClick={locateMe} disabled={locating} style={{
          padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'var(--green-pale)', color: 'var(--green-primary)',
          border: '1.5px solid var(--green-light)', cursor: 'pointer',
        }}>
          {locating ? '📡 Locating…' : '📍 Use My Location'}
        </button>
        {coords && <span style={{ fontSize: 12, color: 'var(--gray-500)', fontFamily: 'var(--font-mono)' }}>
          {coords.lat}, {coords.lng}
        </span>}
      </div>
      <div ref={mapRef} style={{ height, borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--gray-200)' }} />
      <p style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 6 }}>
        📌 Click on the map or drag the marker to pin your exact location
      </p>
    </div>
  );
}

export function MapView({ listings, height = 400, center }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  useEffect(() => {
    if (leafletMap.current || !mapRef.current || !window.L) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView(center || COMMUNITY, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    listings?.forEach(item => {
      if (!item.location_lat || !item.location_lng) return;
      const icon = L.divIcon({
        html: `<div style="background:#1a5c2e;color:#fff;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2)">${item.category_icon || '📍'} ${item.title?.slice(0, 20) || 'Listing'}</div>`,
        className: '',
        iconAnchor: [0, 10],
      });
      L.marker([item.location_lat, item.location_lng], { icon }).addTo(map)
        .bindPopup(`<b>${item.title}</b><br>${item.price ? 'KES ' + item.price : 'Negotiable'}<br><small>${item.seller_name || ''}</small>`);
    });

    leafletMap.current = map;
  }, [listings]);

  return <div ref={mapRef} style={{ height, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--gray-200)' }} />;
}
