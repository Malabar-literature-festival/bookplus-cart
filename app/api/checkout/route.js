// api/checkout/route.js
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
    const { customer, items } = data;

    const bookIds = items.map((item) => item.bookId);
    const books = await Book.find({ _id: { $in: bookIds } });

    const bookMap = books.reduce((acc, book) => {
      acc[book._id.toString()] = book;
      return acc;
    }, {});

    const orderItems = [];

    for (const item of items) {
      const book = bookMap[item.bookId];

      if (!book) {
        return NextResponse.json(
          { success: false, error: `Book not found: ${item.bookId}` },
          { status: 404 }
        );
      }

      orderItems.push({
        bookId: book._id,
        quantity: item.quantity,
        title: book.title,
        subject: book.subject,
        class: book.class,
        section: book.section,
        serialNumber: book.serialNumber,
        publisher: book.publisher,
      });
    }

    const order = await Order.create({
      customer,
      items: orderItems,
      status: "pending",
      academicYear: "2024-2025",
      createdAt: new Date(),
    });

    const pdfBuffer = await generateInvoice(order);
    await sendOrderConfirmation(order, pdfBuffer);

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order._id,
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
