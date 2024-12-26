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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 500px;">
                  <!-- Brand Header -->
                  <tr>
                    <td style="padding-bottom: 40px;">
                      <div style="display: inline-block; padding: 12px 24px; background-color: #111827; border-radius: 40px;">
                        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: white; font-size: 14px; font-weight: 500; letter-spacing: 2px;">
                          BOOK PLUS
                        </span>
                      </div>
                    </td>
                  </tr>

                  <!-- Welcome Message -->
                  <tr>
                    <td style="padding-bottom: 40px;">
                      <h1 style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 28px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">
                        Order Confirmed
                      </h1>
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; color: #6B7280;">
                        Thank you for your purchase, ${order.customer.name}
                      </p>
                    </td>
                  </tr>

                  <!-- Order Info Box -->
                  <tr>
                    <td style="padding: 24px; background-color: #F8FAFC; border-radius: 16px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="50%" style="padding-right: 12px;">
                            <p style="margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280;">
                              Order ID
                            </p>
                            <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #111827;">
                              #${order._id}
                            </p>
                          </td>
                          <td width="50%" style="padding-left: 12px;">
                            <p style="margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6B7280;">
                              Date
                            </p>
                            <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; color: #111827;">
                              ${new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Next Steps -->
                  <tr>
                    <td style="padding: 40px 0 20px;">
                      <h2 style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; font-weight: 600; color: #111827;">
                        What's Next?
                      </h2>
                      <ol style="margin: 0; padding: 0 0 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 24px; color: #4B5563;">
                        <li style="margin-bottom: 12px;">Check your invoice in the attachment</li>
                        <li>We'll notify you when your order is ready</li>
                      </ol>
                    </td>
                  </tr>

                  <!-- Store Info -->
                  <tr>
                    <td style="padding: 20px 24px; background-color: #F8FAFC; border-radius: 16px;">
                      <p style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; color: #111827;">
                        Questions about your order?
                      </p>
                      <p style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 20px; color: #4B5563;">
                        Call us at <a href="tel:+919562661133" style="color: #111827; text-decoration: none; font-weight: 500;">+91 95626 61133</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding-top: 40px; border-top: 1px solid #E5E7EB; margin-top: 40px;">
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; color: #9CA3AF;">
                        Book Plus • Hidaya Nagar, Chemmad • 676304
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
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
