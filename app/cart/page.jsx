"use client";

import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag
            className="mx-auto h-10 w-10 md:h-12 md:w-12 text-zinc-400"
            strokeWidth={1.5}
          />
          <h2 className="mt-4 text-2xl md:text-3xl font-medium text-zinc-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm md:text-base text-zinc-500 font-light">
            Add some books to get started!
          </p>
          <div className="mt-6 md:mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <div className="max-w-6xl mx-auto pt-16 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-medium text-zinc-900">
          Shopping Cart
        </h1>

        <div className="mt-8 md:mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <section className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-100 divide-y divide-zinc-100">
              {cart.items.map((item) => (
                <div key={item.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    {/* Book Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-zinc-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-zinc-500 font-light">{item.author}</p>
                    </div>

                    {/* Price for Mobile */}
                    <div className="md:hidden">
                      <span className="text-lg font-light text-zinc-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
                      <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={item.quantity === 1}
                          className="p-2 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4 text-zinc-600" />
                        </button>
                        <span className="w-12 text-center font-medium text-zinc-900 border-x">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.min(item.stock, item.quantity + 1)
                            )
                          }
                          disabled={item.quantity >= item.stock}
                          className="p-2 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4 text-zinc-600" />
                        </button>
                      </div>

                      {/* Price for Desktop */}
                      <span className="hidden md:block text-lg font-light text-zinc-900 min-w-[80px] text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Summary */}
          <section className="mt-6 lg:mt-0 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-medium text-zinc-900 mb-4 md:mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <span className="text-zinc-600 font-light">Subtotal</span>
                  <span className="text-lg font-medium text-zinc-900">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2">
                  <Link href="/checkout" className="block w-full">
                    <button className="w-full bg-zinc-900 rounded-lg shadow-sm py-3 px-4 text-sm md:text-base font-medium text-white hover:bg-zinc-800 transition-colors">
                      Proceed to Checkout
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
