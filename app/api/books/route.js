// app/api/books/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";

export async function GET() {
  try {
    await connectDB();
    const books = await Book.find({});
    return NextResponse.json({ success: true, data: books });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();

    // Log the incoming data for debugging
    console.log("Incoming data:", data);

    // Validate required fields
    if (
      !data.serialNumber ||
      !data.class ||
      !data.subject ||
      !data.title ||
      !data.publisher ||
      !data.section
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure data types are correct
    const bookData = {
      serialNumber: Number(data.serialNumber),
      class: Number(data.class),
      subject: String(data.subject),
      title: String(data.title),
      publisher: String(data.publisher),
      section: String(data.section),
      remarks: data.remarks ? String(data.remarks) : "",
      academicYear: data.academicYear || "2024-2025",
    };

    // Log the formatted data
    console.log("Formatted data:", bookData);

    // Create the book
    const book = await Book.create(bookData);

    // Log the created book
    console.log("Created book:", book);

    return NextResponse.json({ success: true, data: book }, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
