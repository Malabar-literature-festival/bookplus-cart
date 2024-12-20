// app/api/cart/validate/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";

export async function POST(request) {
  try {
    await connectDB();

    const { items } = await request.json();
    const bookIds = items.map((item) => item.id);

    // Get current book data
    const books = await Book.find({ _id: { $in: bookIds } });
    const bookMap = books.reduce((acc, book) => {
      acc[book._id.toString()] = book;
      return acc;
    }, {});

    // Validate each item
    const validationResults = items.map((item) => {
      const book = bookMap[item.id];

      if (!book) {
        return {
          id: item.id,
          valid: false,
          error: "Book not found",
          remove: true,
        };
      }

      const stockAvailable = book.stock >= item.quantity;
      const priceMatches = book.price === item.price;

      return {
        id: item.id,
        valid: stockAvailable && priceMatches,
        currentPrice: book.price,
        availableStock: book.stock,
        error: !stockAvailable
          ? "Insufficient stock"
          : !priceMatches
          ? "Price has changed"
          : null,
        update: !priceMatches,
        updateQuantity: !stockAvailable ? book.stock : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: validationResults,
    });
  } catch (error) {
    console.error("Cart validation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
