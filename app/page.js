"use client";
import { useState, useEffect } from "react";
import { Book, Search, ShoppingBag, Trash2 } from "lucide-react";
import BookCard from "@/components/BookCard";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const router = useRouter();
  const { getCartItemCount, clearCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/books");
      const data = await response.json();
      if (data.success) {
        setBooks(data.data);
      } else {
        setError("Failed to fetch books");
      }
    } catch (error) {
      setError("Failed to fetch books");
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  // Get unique classes and subjects for filters
  const classes = [...new Set(books.map((book) => book.class))].sort(
    (a, b) => a - b
  );
  const subjects = [...new Set(books.map((book) => book.subject))].sort();

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.publisher.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      !selectedClass || book.class.toString() === selectedClass;
    const matchesSubject = !selectedSubject || book.subject === selectedSubject;

    return matchesSearch && matchesClass && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white pb-24 mt-16">
      {/* Academic Year Banner */}
      {/* <div className="bg-zinc-900 text-white py-2 text-center text-sm">
        <span className="font-medium">Academic Year 2024-2025</span>
      </div> */}

      <header className="pt-8 pb-2 px-4">
        <div className="max-w-6xl mx-auto">
          {/* <h1 className="text-2xl font-medium text-zinc-900 mb-6 text-center">
            DH Islamic University Book List
          </h1> */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, subject, or publisher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200"
            >
              <option value="">All Classes</option>
              {classes.map((classNum) => (
                <option key={classNum} value={classNum}>
                  Class {classNum}
                </option>
              ))}
            </select>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-zinc-100">
          <div className="hidden md:grid grid-cols-12 gap-6 p-6 border-b border-zinc-100 bg-zinc-50/50">
            <div className="col-span-2 text-sm font-medium text-zinc-500">
              Class & No.
            </div>
            <div className="col-span-4 text-sm font-medium text-zinc-500">
              Book Details
            </div>
            <div className="col-span-2 text-sm font-medium text-zinc-500">
              Section
            </div>
            <div className="col-span-4 text-sm font-medium text-zinc-500 text-right">
              Order
            </div>
          </div>

          {loading ? (
            <div className="p-8 md:p-12 text-center text-zinc-500">
              Loading books...
            </div>
          ) : error ? (
            <div className="p-8 md:p-12 text-center text-red-500">{error}</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <BookCard
                    key={book._id}
                    book={{
                      ...book,
                      id: book._id,
                    }}
                  />
                ))
              ) : (
                <div className="p-8 md:p-12 text-center text-zinc-500 font-light">
                  {searchQuery || selectedClass || selectedSubject
                    ? "No books found matching your search criteria."
                    : "No books available at the moment."}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Controls */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 z-40">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-end gap-3">
              {/* Desktop view */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => clearCart()}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Clear Order</span>
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Complete Order ({getCartItemCount()})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
