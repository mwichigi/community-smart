import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import './assets/styles/global.css';

import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Marketplace from './components/marketplace/Marketplace';
import PostListing from './components/marketplace/PostListing';
import Housing from './components/housing/Housing';
import Services from './components/services/Services';
import AIAssistant from './components/ai-assistant/AIAssistant';
import Messages from './components/common/Messages';
import ListingDetail from './pages/ListingDetail';
import Admin from './pages/Admin';
import Admin from './pages/Admin';

function NotFound() {
  // Wake up Render backend on page load
  useEffect(() => {
    fetch('https://community-smart-backend.onrender.com/health')
      .catch(() => {});
  }, []);

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: 'var(--off-white)' }}>
      <div style={{ fontSize: 72 }}>🌾</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--gray-900)' }}>Page Not Found</h1>
      <p style={{ color: 'var(--gray-500)' }}>This page doesn't exist on Community Smart.</p>
      <a href="/" style={{ padding: '11px 28px', background: 'var(--green-primary)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 15 }}>Go Home</a>
    </div>
  );
}

export default function App() {
  // Wake up Render backend on page load
  useEffect(() => {
    fetch('https://community-smart-backend.onrender.com/health')
      .catch(() => {});
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ListingDetail />} />
          <Route path="/post-listing" element={<PostListing />} />
          <Route path="/post-housing" element={<PostListing />} />
          <Route path="/post-service" element={<PostListing />} />
          <Route path="/housing" element={<Housing />} />
          <Route path="/services" element={<Services />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
