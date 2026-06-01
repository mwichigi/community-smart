import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export const USER_TYPES = {
  FARMER: 'farmer',
  BUYER: 'buyer',
  RETAILER: 'retailer',
  WHOLESALER: 'wholesaler',
  AGROVET: 'agrovet',
  VET: 'vet',
  LANDLORD: 'landlord',
  GENERAL: 'general',
};

export const USER_TYPE_LABELS = {
  farmer: 'Farmer',
  buyer: 'Buyer / Consumer',
  retailer: 'Retailer (Shop Owner)',
  wholesaler: 'Wholesaler',
  agrovet: 'Agrovet Supplier',
  vet: 'Veterinary Service',
  landlord: 'Landlord',
  general: 'General User',
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('community-smart_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('community-smart_token') || null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) localStorage.setItem('community-smart_user', JSON.stringify(user));
    else localStorage.removeItem('community-smart_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('community-smart_token', token);
    else localStorage.removeItem('community-smart_token');
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const addNotification = (msg, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  return (
    <AppContext.Provider value={{ user, token, login, logout, notifications, addNotification }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
