"use client";
import { useState, useEffect } from "react";
import { Book, Search } from "lucide-react";
import BookCard from "@/components/BookCard";

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
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white mt-10">
      <header className="pt-16 md:pt-32 pb-8 md:pb-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <Book
              className="w-8 md:w-10 h-8 md:h-10 text-zinc-800"
              strokeWidth={1.5}
            />
            <span className="text-xs md:text-sm tracking-widest text-zinc-400 font-light">
              COLLECTION
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium text-zinc-900 mb-6 md:mb-8 tracking-tight">
            Discover Books Worth Reading
          </h1>

          <div className="relative max-w-xl">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all duration-200 shadow-sm text-sm md:text-base"
            />
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
