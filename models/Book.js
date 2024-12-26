// models/Book.js
import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: Number,
      required: true,
    },
    class: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      default: "",
    },
    academicYear: {
      type: String,
      default: "2024-2025",
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.models.Book || mongoose.model("Book", BookSchema);
export default Book;
