"use client";
import { useEffect, useState, useRef } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Upload,
  Download,
  Book,
  Search,
} from "lucide-react";
import * as XLSX from "xlsx";
import Link from "next/link";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const fileInputRef = useRef(null);
  const [newBook, setNewBook] = useState({
    serialNumber: "",
    class: "",
    subject: "",
    title: "",
    publisher: "",
    section: "",
    remarks: "",
    academicYear: "2024-2025",
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
      book.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.publisher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      // Format the data before sending
      const bookData = {
        ...newBook,
        serialNumber: Number(newBook.serialNumber),
        class: Number(newBook.class),
      };

      // Log the data being sent
      console.log("Sending book data:", bookData);

      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.success) {
        setBooks([data.data, ...books]);
        setShowAddModal(false);
        setNewBook({
          serialNumber: "",
          class: "",
          subject: "",
          title: "",
          publisher: "",
          section: "",
          remarks: "",
          academicYear: "2024-2025",
        });
      } else {
        // Show error message
        alert(data.error || "Failed to add book");
      }
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Failed to add book");
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Skip header row and process data
          const processedData = [];
          for (let i = 2; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length === 0 || !row[0]) continue;

            const book = {
              serialNumber: row[0],
              class: row[1],
              subject: row[2] || "",
              title: row[3] || "",
              publisher: row[4] || "",
              section: row[5] || "",
              remarks: row[6] || "",
              academicYear: "2024-2025",
            };

            if (book.title && book.class) {
              processedData.push(book);
            }
          }

          // Upload all books
          for (const book of processedData) {
            try {
              const response = await fetch("/api/books", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(book),
              });
              const data = await response.json();
              if (!data.success) {
                console.error("Error adding book:", book.title);
              }
            } catch (error) {
              console.error("Error uploading book:", error);
            }
          }

          fetchBooks();
          alert("Books imported successfully!");
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing file. Please check the file format.");
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
                DH Syllabus Books Management
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-800 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Import Excel
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Add New Book
              </button>
            </div>
          </div>

          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>
            <div>
              <Link href="/admin/orders">Order</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-6 p-6 bg-zinc-50 border-b border-zinc-200">
            <div className="col-span-1 text-sm font-medium text-zinc-500">
              No.
            </div>
            <div className="col-span-1 text-sm font-medium text-zinc-500">
              Class
            </div>
            <div className="col-span-2 text-sm font-medium text-zinc-500">
              Subject
            </div>
            <div className="col-span-4 text-sm font-medium text-zinc-500">
              Book Details
            </div>
            <div className="col-span-2 text-sm font-medium text-zinc-500">
              Section
            </div>
            <div className="col-span-2 text-sm font-medium text-zinc-500 text-right">
              Actions
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                className="grid grid-cols-12 gap-6 p-6 items-center"
              >
                <div className="col-span-1">
                  <span className="text-sm text-zinc-900">
                    {book.serialNumber}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-sm text-zinc-900">{book.class}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-zinc-900">{book.subject}</span>
                </div>
                <div className="col-span-4">
                  <h3 className="text-sm font-medium text-zinc-900 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-zinc-500">{book.publisher}</p>
                  {book.remarks && (
                    <p className="text-xs text-zinc-400 mt-1">{book.remarks}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-zinc-900">{book.section}</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
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
                    Serial Number
                  </label>
                  <input
                    type="number"
                    required
                    value={newBook.serialNumber}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        serialNumber: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Class
                  </label>
                  <input
                    type="number"
                    required
                    value={newBook.class}
                    onChange={(e) =>
                      setNewBook({
                        ...newBook,
                        class: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newBook.subject}
                    onChange={(e) =>
                      setNewBook({ ...newBook, subject: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
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
                    Publisher
                  </label>
                  <input
                    type="text"
                    required
                    value={newBook.publisher}
                    onChange={(e) =>
                      setNewBook({ ...newBook, publisher: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Section
                  </label>
                  <input
                    type="text"
                    required
                    value={newBook.section}
                    onChange={(e) =>
                      setNewBook({ ...newBook, section: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={newBook.remarks}
                    onChange={(e) =>
                      setNewBook({ ...newBook, remarks: e.target.value })
                    }
                    rows={3}
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
                    Serial Number
                  </label>
                  <input
                    type="number"
                    required
                    value={editingBook.serialNumber}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        serialNumber: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Class
                  </label>
                  <input
                    type="number"
                    required
                    value={editingBook.class}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        class: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.subject}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
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
                    Publisher
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.publisher}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        publisher: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Section
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBook.section}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        section: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={editingBook.remarks}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        remarks: e.target.value,
                      })
                    }
                    rows={3}
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
