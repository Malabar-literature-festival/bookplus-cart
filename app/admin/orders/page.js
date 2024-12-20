"use client";
import { useState, useEffect } from "react";
import {
  Package,
  Search,
  ChevronDown,
  X,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";

const ORDER_STATUS = {
  pending: {
    label: "Ordered",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700",
  },
  processing: {
    label: "Processing",
    icon: AlertCircle,
    className: "bg-blue-50 text-blue-700",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className: "bg-indigo-50 text-indigo-700",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    className: "bg-green-50 text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-50 text-red-700",
  },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/orders");
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (error) {
      setError("Failed to fetch orders");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setShowOrderDetails(null);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }) => {
    const statusConfig = ORDER_STATUS[status];
    const Icon = statusConfig.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.className}`}
      >
        <Icon className="w-4 h-4" />
        {statusConfig.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-zinc-800" strokeWidth={1.5} />
              <h1 className="text-2xl font-medium text-zinc-900">
                Orders Management
              </h1>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200 bg-white"
            >
              <option value="all">All Status</option>
              {Object.entries(ORDER_STATUS).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-zinc-100">
          {loading ? (
            <div className="p-12 text-center text-zinc-500">
              Loading orders...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">{error}</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredOrders.map((order) => (
                <div key={order._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-900">
                        Order #{order._id}
                      </h3>
                      <div className="mt-1 text-sm text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} />
                      <button
                        onClick={() => setShowOrderDetails(order)}
                        className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
                      >
                        <ChevronDown className="w-5 h-5 text-zinc-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="p-12 text-center text-zinc-500">
                  No orders found matching your search.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-medium text-zinc-900">
                Order Details
              </h2>
              <button
                onClick={() => setShowOrderDetails(null)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">
                    Customer Information
                  </h3>
                  <div className="text-sm text-zinc-600">
                    <p>{showOrderDetails.customer.name}</p>
                    <p>{showOrderDetails.customer.email}</p>
                    <p>{showOrderDetails.customer.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">
                    Shipping Address
                  </h3>
                  <div className="text-sm text-zinc-600">
                    <p>{showOrderDetails.shipping.address}</p>
                    <p>{showOrderDetails.shipping.city}</p>
                    <p>{showOrderDetails.shipping.postalCode}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-6">
                <h3 className="text-sm font-medium text-zinc-900 mb-4">
                  Order Items
                </h3>
                <div className="space-y-4">
                  {showOrderDetails.items.map((item) => (
                    <div
                      key={item.bookId}
                      className="flex justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium text-zinc-900">
                          {item.title}
                        </p>
                        <p className="text-zinc-500">{item.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-900">
                          ₹{item.price.toFixed(2)} × {item.quantity}
                        </p>
                        <p className="font-medium text-zinc-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-200 mt-6 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-zinc-900">
                    Total
                  </span>
                  <span className="text-xl font-medium text-zinc-900">
                    ₹{showOrderDetails.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-200 mt-6 pt-6">
                <h3 className="text-sm font-medium text-zinc-900 mb-4">
                  Update Status
                </h3>
                <div className="flex gap-2">
                  {Object.entries(ORDER_STATUS).map(([status, { label }]) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleUpdateStatus(showOrderDetails._id, status)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        showOrderDetails.status === status
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
