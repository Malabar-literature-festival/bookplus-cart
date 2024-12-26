"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, AlertCircle, X } from "lucide-react";
import { ProcessingLoader } from "@/components/LoadingAnimations";
import { useCart } from "@/context/CartContext"; // Import useCart

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, removeFromCart } = useCart(); // Use cart context
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/");
    }
  }, [cartItems, router]);

  const removeItem = (itemId) => {
    removeFromCart(itemId); // Use context method instead of local storage

    if (cartItems.length <= 1) { // Check if this was the last item
      router.push("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProcessingStep(0);

    try {
      // Cart validation
      setProcessingStep(1);
      // const validateResponse = await fetch("/api/cart/validate", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ items: cartItems }),
      // });

      // const validationData = await validateResponse.json();

      // if (!validationData.success) {
      //   throw new Error(validationData.error);
      // }

      // // Check invalid items
      // const invalidItems = validationData.data.filter((item) => !item.valid);
      // if (invalidItems.length > 0) {
      //   const errorMessages = invalidItems.map((item) => item.error);
      //   throw new Error(`Validation failed: ${errorMessages.join(", ")}`);
      // }

      // Process checkout
      setProcessingStep(2);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          shipping: {
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
          },
          items: cartItems.map((item) => ({
            bookId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Show processing state for 1.5 seconds
      setProcessingStep(3);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to success page
      const successUrl = `/checkout/success?orderId=${data.data.orderId}`;
      router.push(successUrl);
    } catch (error) {
      setError(error.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
      setProcessingStep(0);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <div className="max-w-3xl mx-auto pt-32 pb-24 px-6">
        <h1 className="text-4xl font-medium text-zinc-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Error processing order
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6">
            <h2 className="text-xl font-medium text-zinc-900 mb-6">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6">
            <h2 className="text-xl font-medium text-zinc-900 mb-6">
              Shipping Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                  placeholder="Enter your street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-shadow"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-6">
            <h2 className="text-xl font-medium text-zinc-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 border-t border-zinc-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-zinc-900">
                        {item.title}
                      </h3>
                      <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                        Class {item.class}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">
                      {item.subject} • {item.section}
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-3 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Place Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <ProcessingLoader step={processingStep} />
        </div>
      )}
    </div>
  );
}