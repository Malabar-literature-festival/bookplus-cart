// models/Book.js
import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    author: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    stock: {
      type: Number,
    },
    coverImage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Book || mongoose.model("Book", BookSchema);
