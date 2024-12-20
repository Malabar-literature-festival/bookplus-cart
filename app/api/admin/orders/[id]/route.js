// app/api/admin/orders/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { status } = await request.json();

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
