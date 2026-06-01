import React, { createContext, useContext, useState } from 'react';
import { haptic } from './api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.barcode === product.barcode);
      if (existing) return prev.map(i => i.barcode === product.barcode ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, { ...product, quantity: qty }];
    });
    haptic();
  };

  const updateQty = (barcode, delta) => {
    setItems(prev => {
      const next = prev.map(i => i.barcode === barcode ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0);
      return next;
    });
    haptic();
  };

  const removeItem = barcode => setItems(prev => prev.filter(i => i.barcode !== barcode));

  const clearCart = () => setItems([]);

  const total    = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const expectedWeight = items.reduce((s, i) => s + i.weight * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, total, totalQty, expectedWeight }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
