"use client";
import { useState, useEffect } from "react";
import { Book, Search } from "lucide-react";
import BookCard from "@/components/BookCard";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <header className="pt-14 pb-2 px-4">
        <div className="flex items-center justify-center min-h-[120px]">
          <div className="relative w-full max-w-lg mx-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2 px-1 text-gray-800 placeholder-gray-400 focus:outline-none text-base"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-zinc-100">
          <div className="hidden md:grid grid-cols-12 gap-6 p-6 border-b border-zinc-100 bg-zinc-50/50">
            <div className="col-span-4 text-sm font-medium text-zinc-500">
              Book Details
            </div>
            <div className="col-span-2 text-sm font-medium text-zinc-500">
              Price
            </div>
            <div className="col-span-2 text-sm font-medium text-zinc-500">
              Status
            </div>
            <div className="col-span-4 text-sm font-medium text-zinc-500 text-right">
              Actions
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
                  No books found matching your search.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
