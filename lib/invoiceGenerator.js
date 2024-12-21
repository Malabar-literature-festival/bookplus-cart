// lib/invoiceGenerator.js
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function generateInvoice(order) {
  try {
    // Check if we're in production (Netlify)
    const isProd = process.env.NODE_ENV === "production";

    let browserConfig;
    if (isProd) {
      browserConfig = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };
    } else {
      // Development configuration
      browserConfig = {
        // For Windows
        executablePath:
          process.platform === "win32"
            ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            : // For macOS
              process.platform === "darwin"
              ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
              : // For Linux
                "/usr/bin/google-chrome",
        headless: "new",
        args: ["--no-sandbox"],
      };
    }

    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/inter/3.19.3/inter.css">
        <style>
          :root {
            --primary-color: #2563eb;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --border-color: #e5e7eb;
            --background-subtle: #f9fafb;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 60px;
            padding-bottom: 30px;
            border-bottom: 1px solid var(--border-color);
          }
          
          .brand {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          
          .brand h1 {
            font-size: 28px;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 8px;
          }
          
          .invoice-label {
            font-size: 24px;
            color: var(--text-secondary);
            font-weight: 500;
          }
          
          .invoice-info {
            text-align: right;
            color: var(--text-secondary);
          }
          
          .invoice-info p {
            margin-bottom: 4px;
          }
          
          .invoice-info strong {
            color: var(--text-primary);
          }
          
          .address-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
            margin-bottom: 40px;
          }
          
          .address-block h3 {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            margin-bottom: 12px;
          }
          
          .address-block p {
            margin-bottom: 4px;
            font-size: 15px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
            font-size: 15px;
          }
          
          th {
            background-color: var(--background-subtle);
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          td {
            padding: 16px;
            border-bottom: 1px solid var(--border-color);
          }
          
          .quantity-col {
            text-align: center;
          }
          
          .amount-col {
            text-align: right;
          }
          
          .price-col {
            text-align: right;
          }
          
          .total-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid var(--border-color);
          }
          
          .total-row {
            display: flex;
            justify-content: flex-end;
            gap: 40px;
            width: 300px;
          }
          
          .total-label {
            color: var(--text-secondary);
            font-weight: 500;
          }
          
          .total-amount {
            font-weight: 600;
            font-size: 16px;
          }
          
          .grand-total {
            font-size: 20px;
            font-weight: 700;
            color: var(--primary-color);
          }
          
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
            text-align: center;
            color: var(--text-secondary);
            font-size: 14px;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <h1>BookPlus Store</h1>
            <span class="invoice-label">Invoice</span>
          </div>
          <div class="invoice-info">
            <p><strong>Order Id:</strong> #${order._id}</p>
            <p><strong>Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </div>
        </div>

        <div class="address-section">
          <div class="address-block">
            <h3>Bill To</h3>
            <p><strong>${order.customer.name}</strong></p>
            <p>${order.customer.email}</p>
            <p>${order.customer.phone}</p>
          </div>
          <div class="address-block">
            <h3>Ship To</h3>
            <p><strong>${order.shipping.address}</strong></p>
            <p>${order.shipping.city}</p>
            <p>${order.shipping.postalCode}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Author</th>
              <th class="quantity-col">Qty</th>
              <th class="price-col">Price</th>
              <th class="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td><strong>${item.title}</strong></td>
                <td>${item.author}</td>
                <td class="quantity-col">${item.quantity}</td>
                <td class="price-col">₹${item.price.toFixed(2)}</td>
                <td class="amount-col">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-amount">₹${order.total.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span class="total-label">Tax (0%):</span>
            <span class="total-amount">₹0.00</span>
          </div>
          <div class="total-row">
            <span class="total-label">Grand Total:</span>
            <span class="total-amount grand-total">₹${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for purchasing with us!</p>
        </div>
      </body>
      </html>
    `;

    await page.setContent(invoiceHtml);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await browser.close();
    return pdf;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
}
