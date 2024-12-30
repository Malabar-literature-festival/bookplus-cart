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
  Pencil,
  Save,
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
  const [editMode, setEditMode] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleEditClick = (order) => {
    setEditMode(true);
    setEditingOrder({
      ...order,
      customer: { ...order.customer },
      items: order.items.map((item) => ({ ...item })),
    });
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/orders/${editingOrder._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: editingOrder.customer,
          items: editingOrder.items,
          academicYear: editingOrder.academicYear,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrders(
          orders.map((order) =>
            order._id === editingOrder._id ? data.data : order
          )
        );
        setEditMode(false);
        setEditingOrder(null);
        setShowOrderDetails(data.data);
      } else {
        alert("Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleItemQuantityChange = (index, newQuantity) => {
    setEditingOrder((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, quantity: parseInt(newQuantity) || 0 } : item
      ),
    }));
  };

  const handleCustomerInfoChange = (field, value) => {
    setEditingOrder((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
    }));
  };

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

      {/* Updated Order Details Modal with Edit Mode */}
      {showOrderDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h2 className="text-xl font-medium text-zinc-900">
                  Order Details
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Academic Year:{" "}
                  {editMode ? (
                    <input
                      type="text"
                      value={editingOrder.academicYear}
                      onChange={(e) =>
                        setEditingOrder((prev) => ({
                          ...prev,
                          academicYear: e.target.value,
                        }))
                      }
                      className="px-2 py-1 border rounded"
                    />
                  ) : (
                    showOrderDetails.academicYear
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button
                    onClick={() => handleEditClick(showOrderDetails)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Order
                  </button>
                )}
                {editMode && (
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                )}
                <button
                  onClick={() => handleDownloadPDF(showOrderDetails._id)}
                  disabled={downloading}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors 
                    ${downloading ? "bg-zinc-100 text-zinc-400" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}
                >
                  <Download className="w-4 h-4" />
                  {downloading ? "Downloading..." : "Download PDF"}
                </button>
                <button
                  onClick={() => {
                    setShowOrderDetails(null);
                    setEditMode(false);
                    setEditingOrder(null);
                  }}
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
                  <div className="text-sm text-zinc-600 space-y-2">
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          value={editingOrder.customer.name}
                          onChange={(e) =>
                            handleCustomerInfoChange("name", e.target.value)
                          }
                          className="w-full px-3 py-1.5 border rounded"
                          placeholder="Name"
                        />
                        <input
                          type="email"
                          value={editingOrder.customer.email}
                          onChange={(e) =>
                            handleCustomerInfoChange("email", e.target.value)
                          }
                          className="w-full px-3 py-1.5 border rounded"
                          placeholder="Email"
                        />
                        <input
                          type="text"
                          value={editingOrder.customer.mobileNumber}
                          onChange={(e) =>
                            handleCustomerInfoChange(
                              "mobileNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-1.5 border rounded"
                          placeholder="Mobile Number"
                        />
                        <input
                          type="text"
                          value={editingOrder.customer.whatsappNumber}
                          onChange={(e) =>
                            handleCustomerInfoChange(
                              "whatsappNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-1.5 border rounded"
                          placeholder="WhatsApp Number"
                        />
                      </>
                    ) : (
                      <>
                        <p>{showOrderDetails.customer.name}</p>
                        <p>{showOrderDetails.customer.email}</p>
                        <p>Mobile: {showOrderDetails.customer.mobileNumber}</p>
                        <p>
                          WhatsApp: {showOrderDetails.customer.whatsappNumber}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-zinc-900 mb-2">
                    Institution Details
                  </h3>
                  <div className="text-sm text-zinc-600">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4" />
                      {editMode ? (
                        <input
                          type="text"
                          value={editingOrder.customer.institution}
                          onChange={(e) =>
                            handleCustomerInfoChange(
                              "institution",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-1.5 border rounded"
                          placeholder="Institution"
                        />
                      ) : (
                        <p>{showOrderDetails.customer.institution}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-6">
                <h3 className="text-sm font-medium text-zinc-900 mb-4">
                  Order Items
                </h3>
                <div className="space-y-4">
                  {(editMode ? editingOrder.items : showOrderDetails.items).map(
                    (item, index) => (
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
                          <div className="font-medium text-zinc-900">
                            Quantity:{" "}
                            {editMode ? (
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemQuantityChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                className="w-20 px-2 py-1 border rounded text-right"
                              />
                            ) : (
                              item.quantity
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {!editMode && (
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
