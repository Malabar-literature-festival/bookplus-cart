"use client";
import { useEffect, useState } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Upload,
  Book,
  Search,
} from "lucide-react";
import Image from "next/image";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    price: "",
    description: "",
    coverImage: "",
    stock: "",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books");
      const data = await response.json();
      if (data.success) {
        setBooks(data.data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBook),
      });
      const data = await response.json();
      if (data.success) {
        setBooks([data.data, ...books]);
        setShowAddModal(false);
        setNewBook({
          title: "",
          author: "",
          price: "",
          description: "",
          coverImage: "",
          stock: "",
        });
      }
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      console.log(editingBook);
      const response = await fetch(`/api/books/${editingBook._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingBook),
      });
      const data = await response.json();
      if (data.success) {
        setBooks(
          books.map((book) => (book._id === editingBook._id ? data.data : book))
        );
        setShowEditModal(false);
        setEditingBook(null);
      }
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await fetch(`/api/books/${bookId}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          setBooks(books.filter((book) => book._id !== bookId));
        }
      } catch (error) {
        console.error("Error deleting book:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book className="w-8 h-8 text-zinc-800" strokeWidth={1.5} />
              <h1 className="text-2xl font-medium text-zinc-900">
                Books Management
              </h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Add New Book
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-6 max-w-md flex justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search books by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>
            {/* route to orders */}
            <div className="flex items-center">
              <button
                onClick={() => (window.location.href = "/admin/orders")}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Orders
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-6 p-6 bg-zinc-50 border-b border-zinc-200">
            <div className="col-span-3 text-sm font-medium text-zinc-500">
              Book Details
            </div>
            <div className="col-span-3 text-sm font-medium text-zinc-500">
              Description
            </div>
            <div className="col-span-2 text-sm font-medium text-zinc-500">
              Price
            </div>
            <div className="col-span-2 text-sm font-medium text-zinc-500">
              Stock
            </div>
            <div className="col-span-1 text-sm font-medium text-zinc-500 text-right">
              Actions
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                className="grid grid-cols-12 gap-6 p-6 items-center"
              >
                <div className="col-span-3">
                  <h3 className="text-sm font-medium text-zinc-900 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-zinc-500">{book.author}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-zinc-600 line-clamp-2">
                    {book.description}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-zinc-900">
                    ₹{book.price.toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-zinc-900">
                    {book.stock} units
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditClick(book)}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book._id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
            {filteredBooks.length === 0 && (
              <div className="p-8 text-center text-zinc-500">
                {searchQuery
                  ? "No books match your search."
                  : "No books added yet. Click 'Add New Book' to get started."}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-medium text-zinc-900">
                Add New Book
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <form onSubmit={handleAddBook} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newBook.title}
                    onChange={(e) =>
                      setNewBook({ ...newBook, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    required
                    value={newBook.author}
                    onChange={(e) =>
                      setNewBook({ ...newBook, author: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newBook.price}
                    onChange={(e) =>
                      setNewBook({ ...newBook, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newBook.stock}
                    onChange={(e) =>
                      setNewBook({ ...newBook, stock: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={newBook.description}
                    onChange={(e) =>
                      setNewBook({ ...newBook, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-medium text-zinc-900">Edit Book</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <form onSubmit={handleEditBook} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.title}
                    onChange={(e) =>
                      setEditingBook({ ...editingBook, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Author
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.author}
                    onChange={(e) =>
                      setEditingBook({ ...editingBook, author: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editingBook.price}
                    onChange={(e) =>
                      setEditingBook({ ...editingBook, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingBook.stock}
                    onChange={(e) =>
                      setEditingBook({ ...editingBook, stock: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    value={editingBook.description}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
