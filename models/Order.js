// models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customer: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
    },
  },
  items: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      subject: {
        type: String,
        required: true,
      },
      class: {
        type: Number,
        required: true,
      },
      section: {
        type: String,
        required: true,
      },
      serialNumber: {
        type: Number,
        required: true,
      },
      publisher: {
        type: String,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  academicYear: {
    type: String,
    default: "2024-2025",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
