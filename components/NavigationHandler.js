// components/NavigationHandler.js
"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NavigationHandler({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>{children}</main>
    </>
  );
}
