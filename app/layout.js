// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import NavigationHandler from "@/components/NavigationHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BookPlus",
  description: "Modern online bookstore",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50/50`}>
        <CartProvider>
          <NavigationHandler>{children}</NavigationHandler>
        </CartProvider>
      </body>
    </html>
  );
}
