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
  School,
  Download,
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
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadPDF = async (orderId) => {
    try {
      setDownloading(true);
      const response = await fetch(`/api/admin/orders/${orderId}/pdf`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.institution
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

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
                placeholder="Search by ID, name, email, or institution..."
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
        {/* Order Summary Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-500">
                Total Orders
              </h3>
              <Package className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {orders.length}
            </p>
          </div>

          {Object.entries(ORDER_STATUS).map(
            ([status, { label, icon: Icon, className }]) => {
              const count = orders.filter(
                (order) => order.status === status
              ).length;
              return (
                <div
                  key={status}
                  className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-zinc-500">
                      {label}
                    </h3>
                    <Icon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-zinc-900">
                    {count}
                  </p>
                </div>
              );
            }
          )}
        </div>

        {/* Detailed Summary Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-100 mb-3">
          <div className="p-6">
            <h2 className="text-lg font-medium text-zinc-900 mb-6">
              Summary Statistics
            </h2>

            <div className="grid grid-cols-2 gap-8">
              {/* Book Statistics */}
              <div>
                <h3 className="text-sm font-medium text-zinc-900 mb-4">
                  Book Orders Summary
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    orders.reduce((acc, order) => {
                      order.items.forEach((item) => {
                        const key = `${item.title} (Class ${item.class} - ${item.section})`;
                        if (!acc[key]) {
                          acc[key] = {
                            quantity: 0,
                            orders: new Set(),
                            publisher: item.publisher,
                            subject: item.subject,
                          };
                        }
                        acc[key].quantity += item.quantity;
                        acc[key].orders.add(order._id);
                      });
                      return acc;
                    }, {})
                  ).map(([book, stats]) => (
                    <div key={book} className="bg-zinc-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-zinc-900">{book}</h4>
                          <p className="text-sm text-zinc-600 mt-1">
                            Publisher: {stats.publisher} • Subject:{" "}
                            {stats.subject}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-zinc-900">
                            Qty: {stats.quantity}
                          </p>
                          <p className="text-sm text-zinc-600">
                            Orders: {stats.orders.size}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Class-wise Statistics */}
              <div>
                <h3 className="text-sm font-medium text-zinc-900 mb-4">
                  Class-wise Summary
                </h3>
                <div className="space-y-4">
                  {Object.entries(
                    orders.reduce((acc, order) => {
                      order.items.forEach((item) => {
                        if (!acc[item.class]) {
                          acc[item.class] = {
                            totalBooks: 0,
                            totalOrders: new Set(),
                            sections: new Set(),
                            subjects: new Set(),
                          };
                        }
                        acc[item.class].totalBooks += item.quantity;
                        acc[item.class].totalOrders.add(order._id);
                        acc[item.class].sections.add(item.section);
                        acc[item.class].subjects.add(item.subject);
                      });
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => a[0] - b[0])
                    .map(([className, stats]) => (
                      <div
                        key={className}
                        className="bg-zinc-50 p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-zinc-900">
                              Class {className}
                            </h4>
                            <p className="text-sm text-zinc-600 mt-1">
                              {Array.from(stats.sections).join(", ")}
                            </p>
                            <p className="text-sm text-zinc-600">
                              Subjects: {stats.subjects.size}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-zinc-900">
                              {stats.totalBooks} Books
                            </p>
                            <p className="text-sm text-zinc-600">
                              {stats.totalOrders.size} Orders
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
                        Institution:{" "}
                        <strong>{order.customer.institution}</strong>
                      </div>
                      <div className="mt-1 text-sm text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-zinc-600">
                        Academic Year: {order.academicYear}
                      </div>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="text-xl font-medium text-zinc-900">
                  Order Details
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Academic Year: {showOrderDetails.academicYear}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(showOrderDetails._id)}
                  disabled={downloading}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors 
                    ${
                      downloading
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                >
                  <Download className="w-4 h-4" />
                  {downloading ? "Downloading..." : "Download PDF"}
                </button>
                <button
                  onClick={() => setShowOrderDetails(null)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-600" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">
                    Customer Information
                  </h3>
                  <div className="text-sm text-zinc-600 space-y-1">
                    <p>{showOrderDetails.customer.name}</p>
                    <p>{showOrderDetails.customer.email}</p>
                    <p>Mobile: {showOrderDetails.customer.mobileNumber}</p>
                    <p>WhatsApp: {showOrderDetails.customer.whatsappNumber}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">
                    Institution Details
                  </h3>
                  <div className="text-sm text-zinc-600">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4" />
                      <p>{showOrderDetails.customer.institution}</p>
                    </div>
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
                      className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-zinc-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-zinc-600">
                          Class {item.class} - {item.section}
                        </p>
                        <p className="text-sm text-zinc-600">
                          Subject: {item.subject}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-zinc-600">
                          Publisher: {item.publisher}
                        </p>
                        <p className="text-sm text-zinc-600">
                          Serial #: {item.serialNumber}
                        </p>
                        <p className="font-medium text-zinc-900">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
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
