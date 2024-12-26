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
          {/* ... (keep existing loading animation) ... */}
          <h2 className="mt-6 text-xl font-medium text-zinc-900">
            Fetching your order details...
          </h2>
          <p className="mt-2 text-zinc-500 text-sm">
            Preparing your book order details
          </p>
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

  const totalItems =
    order?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <OrderConfirmedAnimation />
        <h2 className="mt-6 text-3xl font-medium text-zinc-900">
          Order Confirmed!
        </h2>
        <p className="mt-3 text-zinc-500 font-light">
          Thank you for your order. We've sent the order confirmation to your
          email.
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
                    #{order._id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600">Order Date</span>
                  <span className="text-sm font-medium text-zinc-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600">Total Books</span>
                  <span className="text-sm font-medium text-zinc-900">
                    {totalItems} items
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600">Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600">Delivery To</span>
                  <span className="text-sm font-medium text-zinc-900 text-right">
                    {order.customer.name}
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
            Return to Book List
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
