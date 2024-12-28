// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import NavigationHandler from "@/components/NavigationHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BookPlus",
  description: "Modern online bookstore",
  icons: {
    icon: [{ url: "/bookplus.png", type: "image/png" }],
    shortcut: "/bookplus.png",
    apple: "/bookplus.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/bookplus.png" />
        <link rel="apple-touch-icon" href="/bookplus.png" />
        <link rel="shortcut icon" type="image/png" href="/bookplus.png" />
      </head>
      <body className={`${inter.className} bg-slate-50/50`}>
        <CartProvider>
          <NavigationHandler>{children}</NavigationHandler>
        </CartProvider>
      </body>
    </html>
  );
}
