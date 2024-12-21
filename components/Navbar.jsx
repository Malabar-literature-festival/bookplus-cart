"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-40 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="tracking-wide text-zinc-900">
            BOOKPLUS
          </Link>
        </div>
      </div>
    </nav>
  );
}
