"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  prefix: string;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar items del localStorage al inicializar
  useEffect(() => {
    const savedItems = localStorage.getItem('cartItems');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems) as CartItem[];
        setItems(parsedItems);
      } catch (error) {
        console.error('Error parsing saved cart items:', error);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambie el carrito
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    // Disparar evento para componentes que escuchan localStorage
    window.dispatchEvent(new Event('cartUpdated'));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalPrice,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
