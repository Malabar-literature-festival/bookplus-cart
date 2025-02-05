"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Initialize cart from localStorage
  useEffect(() => {
    const savedItems = JSON.parse(
      localStorage.getItem("checkoutItems") || "[]"
    );
    setCartItems(savedItems);
  }, []);

  const updateCart = (items) => {
    setCartItems(items);
    localStorage.setItem("checkoutItems", JSON.stringify(items));
  };

  const addToCart = (book, quantity) => {
    const currentItems = [...cartItems];
    const existingItemIndex = currentItems.findIndex(
      (item) => item.id === book._id
    );

    // If quantity is 0, remove the item
    if (quantity === 0) {
      if (existingItemIndex >= 0) {
        currentItems.splice(existingItemIndex, 1);
      }
      updateCart(currentItems);
      return;
    }

    if (existingItemIndex >= 0) {
      currentItems[existingItemIndex] = {
        ...currentItems[existingItemIndex],
        quantity,
      };
    } else {
      currentItems.push({
        id: book._id,
        title: book.title,
        subject: book.subject,
        class: book.class,
        section: book.section,
        publisher: book.publisher,
        serialNumber: book.serialNumber,
        quantity,
      });
    }

    updateCart(currentItems);
  };

  const removeFromCart = (bookId) => {
    const updatedItems = cartItems.filter((item) => item.id !== bookId);
    updateCart(updatedItems);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
