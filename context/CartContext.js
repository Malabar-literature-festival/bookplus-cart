// context/CartContext.js
"use client";
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

const initialState = {
  items: [],
};

const cartReducer = (state, action) => {
  let newState;

  switch (action.type) {
    case "ADD_TO_CART":
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        if (existingItem.quantity >= action.payload.stock) {
          return state;
        }

        newState = {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
              : item
          ),
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
        };
      }
      break;

    case "REMOVE_FROM_CART":
      newState = {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
      break;

    case "UPDATE_QUANTITY":
      if (action.payload.quantity === 0) {
        newState = {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
        };
      } else {
        newState = {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id
              ? {
                  ...item,
                  quantity: Math.min(action.payload.quantity, item.stock),
                }
              : item
          ),
        };
      }
      break;

    case "CLEAR_CART":
      newState = initialState;
      break;

    default:
      return state;
  }

  return newState;
};

export function CartProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  // Handle initial load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      dispatch({ type: "HYDRATE", payload: JSON.parse(savedCart) });
    }
    setMounted(true);
  }, []);

  // Save to localStorage on cart changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const addToCart = (book) => {
    dispatch({ type: "ADD_TO_CART", payload: book });
  };

  const removeFromCart = (bookId) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: bookId });
  };

  const updateQuantity = (bookId, quantity) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id: bookId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const cartTotal = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartItemsCount = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemsCount,
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
