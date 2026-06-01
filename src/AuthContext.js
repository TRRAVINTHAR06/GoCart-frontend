import React, { createContext, useContext, useState } from 'react';
import api from './api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(() => JSON.parse(localStorage.getItem('gocart_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('gocart_token') || '');

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const data = res.data || res;
      if (data?.token) {
  localStorage.setItem('gocart_token', data.token);

  const u = {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role
  };

  localStorage.setItem('gocart_user', JSON.stringify(u));
  setToken(data.token);
  setUser(u);

  return { ok: true };
}

      throw new Error(res.message || 'Login failed');
    } catch {
      // Demo fallback
      if (email === 'admin@gocart.com' && password === 'admin@123') {
        const u = { name: 'GoCart Admin', email, role: 'ADMIN' };
        localStorage.setItem('gocart_token', 'demo-token');
        localStorage.setItem('gocart_user', JSON.stringify(u));
        setToken('demo-token');
        setUser(u);
        return { ok: true };
      }
      return { ok: false, message: 'Invalid credentials. Try admin@gocart.com / admin@123' };
    }
  };

  const register = async (body) => {
    try {
      await api.post('/api/auth/register', body);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Registration failed – server may be offline' };
    }
  };

  const logout = () => {
    localStorage.removeItem('gocart_token');
    localStorage.removeItem('gocart_user');
    setToken('');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
