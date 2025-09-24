"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage on initial render
    try {
      const savedCart = localStorage.getItem('ps-kitchenware-cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    try {
      localStorage.setItem('ps-kitchenware-cart', JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number, size?: string) => {
    setCart((prevCart) => {
      // A unique ID for each cart item, based on product ID and size
      const cartItemId = size ? `${product.id}-${size}` : product.id;
      const existingItemIndex = prevCart.findIndex((item) => item.id === cartItemId);
      
      if (existingItemIndex > -1) {
        // If item exists, update its quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // If item doesn't exist, add it to the cart
        const newCartItem: CartItem = { 
          ...product, 
          id: cartItemId, // Override product ID with unique cart item ID
          quantity, 
          size 
        };
        return [...prevCart, newCartItem];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0) // Also remove if quantity becomes 0
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
