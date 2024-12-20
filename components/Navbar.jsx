// components/Navbar.js
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu } from "lucide-react";

export default function Navbar() {
  const { cartItemsCount } = useCart();

  return (
    <nav className="fixed w-full top-0 z-40 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="tracking-wide text-zinc-900">
            BOOKPLUS
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative p-2">
              <ShoppingBag
                className="w-6 h-6 text-zinc-700"
                strokeWidth={1.5}
              />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-zinc-900 text-white rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
