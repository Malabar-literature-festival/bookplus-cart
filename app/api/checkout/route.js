// app/api/checkout/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Book from "@/models/Book";
import { sendOrderConfirmation } from "@/lib/emailService";
import { generateInvoice } from "@/lib/invoiceGenerator";

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const { customer, shipping, items } = data;

    // Validate stock and get current prices
    const bookIds = items.map((item) => item.bookId);
    const books = await Book.find({ _id: { $in: bookIds } });

    const bookMap = books.reduce((acc, book) => {
      acc[book._id.toString()] = book;
      return acc;
    }, {});

    // Validate stock and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const book = bookMap[item.bookId];

      if (!book) {
        return NextResponse.json(
          { success: false, error: `Book not found: ${item.bookId}` },
          { status: 404 }
        );
      }

      if (book.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for book: ${book.title}`,
            availableStock: book.stock,
          },
          { status: 400 }
        );
      }

      const itemTotal = book.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        bookId: book._id,
        quantity: item.quantity,
        price: book.price,
        title: book.title,
        author: book.author,
      });

      await Book.findByIdAndUpdate(book._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Create the order
    const order = await Order.create({
      customer,
      shipping,
      items: orderItems,
      total,
      status: "pending",
      createdAt: new Date(),
    });

    // Generate invoice
    const pdfBuffer = await generateInvoice(order);

    // Send confirmation email with invoice
    await sendOrderConfirmation(order, pdfBuffer);

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order._id,
          total: order.total,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
