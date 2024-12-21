// lib/emailService.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOrderConfirmation(order, pdfBuffer) {
  const mailOptions = {
    from: `"BookPlus Store" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmation #${order._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Thank you for your order!</h2>
        <p>Dear ${order.customer.name},</p>
        <p>Your order has been successfully placed. Please find your invoice attached.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 15px; color: #1f2937;">Order Summary</h3>
          <p style="margin: 5px 0;"><strong>Order Id:</strong> #${order._id}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(
            order.createdAt
          ).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.total.toFixed(
            2
          )}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">Shipping Address</h3>
          <p style="margin: 5px 0;">${order.shipping.address}</p>
          <p style="margin: 5px 0;">${order.shipping.city}</p>
          <p style="margin: 5px 0;">${order.shipping.postalCode}</p>
        </div>

        <p>We'll notify you when your order ships. Thank you for shopping with us!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.9em;">
          <p>If you have any questions, please contact our customer service.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `invoice-${order._id}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
}
