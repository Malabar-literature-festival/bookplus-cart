// components/NavigationHandler.js
"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminAuth from "@/components/AdminAuth";

export default function NavigationHandler({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      {isAdminRoute ? (
        <AdminAuth>{children}</AdminAuth>
      ) : (
        <main>{children}</main>
      )}
    </>
  );
}
