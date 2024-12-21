"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const { getCartItemCount, clearCart } = useCart();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <nav className="fixed w-full top-0 z-40 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="tracking-wide text-zinc-900">
            BOOKPLUS
          </Link>

          {getCartItemCount() > 0 && (
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile view */}
              <button
                onClick={() => clearCart()}
                className="md:hidden flex items-center justify-center w-10 h-10 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleCheckout}
                className="md:hidden flex items-center gap-1 px-3 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{getCartItemCount()}</span>
              </button>

              {/* Desktop view */}
              <button
                onClick={() => clearCart()}
                className="hidden md:flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <span>Clear Cart</span>
              </button>
              <button
                onClick={handleCheckout}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Checkout ({getCartItemCount()})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
