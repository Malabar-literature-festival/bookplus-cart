import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import { generateInvoice } from "@/lib/invoiceGenerator";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log("Order ID:", id);
    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateInvoice(order);

    // Create response with PDF buffer
    const response = new NextResponse(pdfBuffer);

    // Set appropriate headers for PDF download
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="order-${id}.pdf"`
    );

    return response;
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
