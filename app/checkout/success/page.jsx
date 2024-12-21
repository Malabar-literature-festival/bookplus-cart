"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { OrderConfirmedAnimation } from "@/components/LoadingAnimations";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccess() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
      setError("No order ID provided");
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        clearCart();
        setOrder(data.data);
      } else {
        setError(data.error || "Failed to load order details");
      }
    } catch (error) {
      setError("Failed to load order details");
      console.error("Error fetching order:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto">
            {/* Spinning circles background */}
            <div className="absolute inset-0 animate-spin-slow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            {/* Animated book */}
            <div className="absolute inset-0 animate-pulse">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Book cover */}
                <rect
                  x="25"
                  y="20"
                  width="50"
                  height="60"
                  rx="2"
                  fill="#E2E8F0"
                />

                {/* Book pages - animated */}
                <g className="origin-left animate-wave">
                  <rect x="25" y="20" width="5" height="60" fill="#F8FAFC" />
                  <rect x="30" y="20" width="2" height="60" fill="#E2E8F0" />
                  <rect x="33" y="20" width="2" height="60" fill="#E2E8F0" />
                  <rect x="36" y="20" width="2" height="60" fill="#E2E8F0" />
                </g>

                {/* Book title lines */}
                <rect
                  x="40"
                  y="30"
                  width="25"
                  height="2"
                  rx="1"
                  fill="#CBD5E1"
                />
                <rect
                  x="40"
                  y="35"
                  width="20"
                  height="2"
                  rx="1"
                  fill="#CBD5E1"
                />
                <rect
                  x="40"
                  y="40"
                  width="22"
                  height="2"
                  rx="1"
                  fill="#CBD5E1"
                />
              </svg>
            </div>

            {/* Progress circle */}
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeDasharray="283"
                  strokeDashoffset="283"
                  className="animate-progress origin-center -rotate-90"
                />
              </svg>
            </div>
          </div>

          <h2 className="mt-6 text-xl font-medium text-zinc-900">
            Fetching your order details...
          </h2>
          <p className="mt-2 text-zinc-500 text-sm">
            Preparing your reading journey
          </p>

          {/* Loading dots */}
          <div className="flex items-center justify-center gap-1 mt-4">
            <div
              className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle
            className="mx-auto h-12 w-12 text-red-500"
            strokeWidth={1.5}
          />
          <h2 className="mt-4 text-3xl font-medium text-zinc-900">Oops!</h2>
          <p className="mt-2 text-zinc-500 font-light">{error}</p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-3 rounded-lg text-base font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <OrderConfirmedAnimation />
        <h2 className="mt-6 text-3xl font-medium text-zinc-900">
          Order Confirmed!
        </h2>
        <p className="mt-3 text-zinc-500 font-light">
          Thank you for your purchase. We've sent the order confirmation and
          invoice to your email.
        </p>

        {order && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
              <h3 className="text-sm font-medium text-zinc-900">
                Order Details
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600">Order ID</span>
                  <span className="text-sm font-medium text-zinc-900">
                    #{order._id.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600">Order Date</span>
                  <span className="text-sm font-medium text-zinc-900">
                    {new Date(order.createdAt)
                      .toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                      .toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600">Total Amount</span>
                  <span className="text-sm font-medium text-zinc-900">
                    ₹{order.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600">Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg text-base font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          Need help?{" "}
          <a href="/contact" className="text-zinc-900 hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}
