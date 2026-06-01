import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './AuthContext';
import { CartProvider } from './CartContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import { Products, Users, Bills, Analytics, LowStock, CartPage, Settings } from './pages/Pages';

function AppShell() {
  const { user } = useAuth();
  const [lowStockCount, setLowStockCount] = useState(0);

  if (!user) return <Login />;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar lowStockCount={lowStockCount} />
      <main style={{ marginLeft: 240, minHeight: '100vh', padding: 28, flex: 1, maxWidth: 'calc(100vw - 240px)' }}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/scan"      element={<Scan />} />
          <Route path="/cart"      element={<CartPage />} />
          <Route path="/bills"     element={<Bills />} />
          <Route path="/products"  element={<Products />} />
          <Route path="/users"     element={<Users />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/lowstock"  element={<LowStock onLoad={setLowStockCount} />} />
          <Route path="/settings"  element={<Settings />} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppShell />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: 10,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,.12)',
            },
            success: { iconTheme: { primary: '#00D9A3', secondary: 'white' } },
            error:   { iconTheme: { primary: '#FF6B6B', secondary: 'white' } },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
