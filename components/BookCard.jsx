"use client";
import { useState, useEffect } from "react";
import { Plus, Minus, X, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function BookCard({ book }) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const { cartItems, addToCart } = useCart();

  // Update quantity whenever cart items change
  useEffect(() => {
    const savedItem = cartItems.find((item) => item.id === book._id);
    setSelectedQuantity(savedItem ? savedItem.quantity : 0);
  }, [book._id, cartItems]);

  const handleQuantityChange = (value) => {
    const newValue = Math.max(0, Math.min(99, value));
    setSelectedQuantity(newValue);
    addToCart(book, newValue);
  };

  return (
    <>
      <div className="group hover:bg-zinc-50/50 transition-all duration-300">
        <div className="flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-3 md:gap-6 p-4 md:p-6 relative">
          {/* Serial Number and Class */}
          <div className="col-span-2">
            <span className="text-sm text-zinc-500 block">No. {book.serialNumber}</span>
            <span className="text-sm text-zinc-900">Class {book.class}</span>
          </div>

          {/* Book Details */}
          <div className="w-full md:col-span-4">
            <h3 className="text-lg font-medium text-zinc-800 mb-1 md:mb-2 group-hover:text-zinc-900">
              {book.title}
            </h3>
            <p className="text-sm text-zinc-500 mb-1">{book.subject}</p>
            <p className="text-xs text-zinc-400">{book.publisher}</p>
          </div>
          
          {/* Section */}
          <div className="md:col-span-2">
            <span className="text-sm text-zinc-600">{book.section}</span>
            {book.remarks && (
              <p className="text-xs text-zinc-400 mt-1">{book.remarks}</p>
            )}
          </div>

          {/* Order Actions */}
          <div className="w-full md:w-auto md:col-span-4 flex items-center justify-between md:justify-end gap-3">
            <button
              onClick={() => setShowDetails(true)}
              className="p-2 rounded-full hover:bg-zinc-100 transition-all duration-200"
              title="View Details"
            >
              <ChevronDown className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => handleQuantityChange(selectedQuantity - 1)}
                  className="p-2 hover:bg-zinc-50 transition-colors"
                >
                  <Minus className="w-4 h-4 text-zinc-600" />
                </button>
                <input
                  type="number"
                  min="0"
                  max={99}
                  value={selectedQuantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 0)
                  }
                  className="w-12 text-center border-x focus:outline-none"
                />
                <button
                  onClick={() => handleQuantityChange(selectedQuantity + 1)}
                  className="p-2 hover:bg-zinc-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-zinc-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 z-50">
          <div className="bg-white w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl overflow-hidden relative shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 md:top-6 right-4 md:right-6 p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600" strokeWidth={1.5} />
            </button>

            <div className="p-6 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">
                  Class {book.class}
                </span>
                <span className="text-sm bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">
                  {book.subject}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-medium text-zinc-900 mb-2 md:mb-3">
                {book.title}
              </h2>
              <p className="text-base md:text-lg text-zinc-500 mb-2 md:mb-3">
                {book.publisher}
              </p>
              <p className="text-zinc-600 mb-2">Section: {book.section}</p>
              {book.remarks && (
                <p className="text-zinc-500 text-sm mb-6 md:mb-8">
                  Note: {book.remarks}
                </p>
              )}
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => handleQuantityChange(selectedQuantity - 1)}
                    className="p-2 hover:bg-zinc-50 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-zinc-600" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={99}
                    value={selectedQuantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 0)
                    }
                    className="w-12 text-center border-x focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(selectedQuantity + 1)}
                    className="p-2 hover:bg-zinc-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-zinc-600" />
                  </button>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-full md:w-auto px-8 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all duration-200 shadow-sm hover:shadow text-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}