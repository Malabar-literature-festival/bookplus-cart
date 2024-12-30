"use client";
import React, { useState, useEffect } from "react";
import {
  Package,
  Download,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  XCircle,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Filter,
} from "lucide-react";

const ORDER_STATUS = {
  pending: {
    label: "Ordered",
    icon: Clock,
    className: "bg-amber-50 border-amber-200 text-amber-700",
  },
  processing: {
    label: "Processing",
    icon: AlertCircle,
    className: "bg-blue-50 border-blue-200 text-blue-700",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    className: "bg-indigo-50 border-indigo-200 text-indigo-700",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    className: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-rose-50 border-rose-200 text-rose-700",
  },
};

export default function OrderSummaryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedPublisher, setSelectedPublisher] = useState("all");
  const [sortBy, setSortBy] = useState("quantity");
  const [sortOrder, setSortOrder] = useState("desc");

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
    } finally {
      setLoading(false);
    }
  };

  const classes = [
    ...new Set(
      orders.flatMap((order) => order.items.map((item) => item.class))
    ),
  ].sort((a, b) => a - b);
  const publishers = [
    ...new Set(
      orders.flatMap((order) => order.items.map((item) => item.publisher))
    ),
  ].sort();

  const filterOrders = () => {
    return orders.filter((order) => {
      const dateInRange =
        (!dateRange.start ||
          new Date(order.createdAt) >= new Date(dateRange.start)) &&
        (!dateRange.end ||
          new Date(order.createdAt) <= new Date(dateRange.end));
      const statusMatch =
        selectedStatus === "all" || order.status === selectedStatus;
      return dateInRange && statusMatch;
    });
  };

  const getBookStatistics = (filteredOrders) => {
    const stats = filteredOrders.reduce((acc, order) => {
      order.items.forEach((item) => {
        if (
          (selectedClass === "all" || item.class === selectedClass) &&
          (selectedPublisher === "all" || item.publisher === selectedPublisher)
        ) {
          const key = `${item.title} (Class ${item.class} - ${item.section})`;
          if (!acc[key]) {
            acc[key] = {
              quantity: 0,
              orders: new Set(),
              publisher: item.publisher,
              subject: item.subject,
              class: item.class,
            };
          }
          acc[key].quantity += item.quantity;
          acc[key].orders.add(order._id);
        }
      });
      return acc;
    }, {});

    return Object.entries(stats).sort((a, b) => {
      const valueA = sortBy === "quantity" ? a[1].quantity : a[1].orders.size;
      const valueB = sortBy === "quantity" ? b[1].quantity : b[1].orders.size;
      return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
    });
  };

  const handleExportCSV = () => {
    const bookStats = getBookStatistics(filterOrders());
    const csvContent = [
      [
        "Book Title",
        "Class",
        "Publisher",
        "Subject",
        "Total Quantity",
        "Number of Orders",
      ],
      ...bookStats.map(([title, stats]) => [
        title,
        stats.class,
        stats.publisher,
        stats.subject,
        stats.quantity,
        stats.orders.size,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-summary-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredOrders = filterOrders();
  const bookStatistics = getBookStatistics(filteredOrders);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-300 border-t-zinc-800 mx-auto" />
          <p className="text-zinc-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <p className="text-zinc-600">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-zinc-800" strokeWidth={1.5} />
              <h1 className="text-2xl font-medium text-zinc-900">
                Order Summary
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-4 gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        start: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, end: e.target.value }))
                    }
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200 bg-white"
                >
                  <option value="all">All Status</option>
                  {Object.entries(ORDER_STATUS).map(([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200 bg-white"
                >
                  <option value="all">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">
                  Publisher
                </label>
                <select
                  value={selectedPublisher}
                  onChange={(e) => setSelectedPublisher(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200 bg-white"
                >
                  <option value="all">All Publishers</option>
                  {publishers.map((pub) => (
                    <option key={pub} value={pub}>
                      {pub}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-6 gap-4">
          <div className="bg-white p-6 rounded-lg border border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-500">
                  Total Orders
                </p>
                <p className="text-2xl font-semibold text-zinc-900">
                  {filteredOrders.length}
                </p>
              </div>
              <Package className="w-8 h-8 text-zinc-400" strokeWidth={1.5} />
            </div>
          </div>

          {Object.entries(ORDER_STATUS).map(
            ([status, { label, icon: Icon, className }]) => {
              const count = filteredOrders.filter(
                (order) => order.status === status
              ).length;
              return (
                <div
                  key={status}
                  className="bg-white p-6 rounded-lg border border-zinc-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-500">
                        {label}
                      </p>
                      <p className="text-2xl font-semibold text-zinc-900">
                        {count}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${className}`}>
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className="bg-white rounded-lg border border-zinc-200">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-900">
                Book Orders Summary
              </h2>
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200 bg-white"
                >
                  <option value="quantity">Sort by Quantity</option>
                  <option value="orders">Sort by Orders</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="p-2 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  {sortOrder === "asc" ? (
                    <ArrowUpWideNarrow className="w-5 h-5 text-zinc-600" />
                  ) : (
                    <ArrowDownWideNarrow className="w-5 h-5 text-zinc-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {bookStatistics.map(([book, stats]) => (
                <div
                  key={book}
                  className="group p-4 rounded-lg border border-zinc-100 bg-white hover:border-zinc-200 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium text-zinc-900 group-hover:text-zinc-700">
                        {book}
                      </h4>
                      <p className="text-sm text-zinc-500">
                        {stats.publisher} • {stats.subject}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium text-zinc-900">
                        {stats.quantity} copies
                      </p>
                      <p className="text-sm text-zinc-500">
                        {stats.orders.size}{" "}
                        {stats.orders.size === 1 ? "order" : "orders"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {bookStatistics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package
                    className="w-12 h-12 text-zinc-300 mb-4"
                    strokeWidth={1.5}
                  />
                  <p className="text-zinc-500 mb-2">No orders found</p>
                  <p className="text-sm text-zinc-400">
                    Try adjusting your filters to see more results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
