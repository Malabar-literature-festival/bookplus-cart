import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function generateInvoice(order) {
  try {
    const isProd = process.env.NODE_ENV === "production";
    let browserConfig = isProd
      ? {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        }
      : {
          executablePath:
            process.platform === "win32"
              ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
              : process.platform === "darwin"
                ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
                : "/usr/bin/google-chrome",
          headless: "new",
          args: ["--no-sandbox"],
        };

    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Details</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
        <style>
          :root {
            --background: #FFFFFF;
            --surface: #F8FAFC;
            --border: #E2E8F0;
            --text-primary: #0F172A;
            --text-secondary: #64748B;
            --accent: #2563EB;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            line-height: 1.5;
            color: var(--text-primary);
            padding: 1rem;
          }
          
          .document {
            max-width: 900px;
            margin: 0 auto;
          }
          
          .header-section {
            margin-bottom: 1rem;
          }
          
          .brand {
            background: var(--text-primary);
            color: white;
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          
          .title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }
          
          .subtitle {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
          }
          
          .order-meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
            padding: 0.75rem;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
          }
          
          .meta-item {
            display: flex;
            flex-direction: column;
          }
          
          .meta-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.025em;
            color: var(--text-secondary);
            margin-bottom: 0.25rem;
          }
          
          .meta-value {
            font-weight: 600;
            font-size: 0.875rem;
          }
          
          .table-container {
            margin-bottom: 1rem;
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
            table-layout: fixed;
          }
          
          th {
            background: var(--surface);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.025em;
            color: var(--text-secondary);
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
          }
          
          td {
            padding: 0.75rem;
            border-bottom: 1px solid var(--border);
            vertical-align: top;
            word-wrap: break-word;
            line-height: 1.4;
          }
          
          tr:last-child td {
            border-bottom: none;
          }
          
          .quantity-col {
            text-align: center;
            color: var(--accent);
            font-weight: 600;
          }
          
          .footer {
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.875rem;
            padding-top: 0.75rem;
            border-top: 1px solid var(--border);
            position: fixed;
            bottom: 1rem;
            left: 0;
            right: 0;
            background: white;
          }
          
          .footer strong {
            color: var(--text-primary);
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .document {
              max-width: none;
            }
            
            .table-container {
              page-break-inside: auto;
            }
            
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            
            .footer {
              position: fixed;
              bottom: 0;
              width: 100%;
              background: white;
              margin-top: 0.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="document">
          <div class="header-section">
            <div class="brand">Book Plus</div>
            <h1 class="title">Order Details</h1>
            <p class="subtitle">Thank you for your order</p>
          </div>

          <div class="order-meta">
            <div class="meta-item">
              <span class="meta-label">Order Number</span>
              <span class="meta-value">#${order._id}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Order Date</span>
              <span class="meta-value">${new Date(
                order.createdAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Member Name</span>
              <span class="meta-value">${order.customer.name}</span>
            </div>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th style="width: 7%">Sl. No</th>
                  <th style="width: 30%">Text Book</th>
                  <th style="width: 8%">Class</th>
                  <th style="width: 20%">Publisher</th>
                  <th style="width: 22%">Section</th>
                  <th style="width: 13%">QTY</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item, index) => `
                  <tr>
                    <td style="text-align: center">${index + 1}</td>
                    <td>${item.title}</td>
                    <td style="text-align: center">${item.class}</td>
                    <td>${item.publisher}</td>
                    <td>${item.section}</td>
                    <td class="quantity-col">${item.quantity}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <footer class="footer">
            <p><strong>Book Plus</strong></p>
            <p>Hidaya Nagar, Chemmad</p>
            <p>Mobile: 9562661133 • Web: bookplus.co.in • Pin: 676304</p>
          </footer>
        </div>
      </body>
      </html>
    `;

    await page.setContent(invoiceHtml);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });

    await browser.close();
    return pdf;
  } catch (error) {
    console.error("Error generating order details:", error);
    throw error;
  }
}
