// src/app/api/admin/orders/[id]/invoice/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCurrentAdmin } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Generate HTML invoice content
    const invoiceHTML = generateInvoiceHTML(order);

    // Return as downloadable HTML file
    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="invoice-${order.invoiceNumber}.html"`,
        "Content-Length": Buffer.byteLength(invoiceHTML, "utf8").toString(),
      },
    });
  } catch (error) {
    console.error("Download invoice error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(order: any): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.invoiceNumber}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .invoice-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }
        .company-info h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 2.5em;
            font-weight: bold;
        }
        .company-info p {
            margin: 5px 0;
            color: #6b7280;
        }
        .invoice-details {
            text-align: right;
        }
        .invoice-details h2 {
            color: #dc2626;
            margin: 0 0 15px 0;
            font-size: 2em;
        }
        .invoice-details p {
            margin: 8px 0;
            font-size: 16px;
        }
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin: 40px 0;
            gap: 40px;
        }
        .billing-info, .shipping-info {
            flex: 1;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        .billing-info h3, .shipping-info h3 {
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 40px 0;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .items-table th,
        .items-table td {
            border: 1px solid #e5e7eb;
            padding: 15px;
            text-align: left;
        }
        .items-table th {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 0.5px;
        }
        .items-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .items-table .amount {
            text-align: right;
            font-weight: 600;
        }
        .total-section {
            float: right;
            width: 350px;
            margin-top: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 16px;
        }
        .total-row.final {
            font-weight: bold;
            font-size: 20px;
            border-bottom: 2px solid #374151;
            color: #2563eb;
            margin-top: 10px;
            padding-top: 15px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: capitalize;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #dbeafe; color: #1e40af; }
        .status-preparing { background: #fed7aa; color: #ea580c; }
        .status-ready { background: #e0e7ff; color: #5b21b6; }
        .status-delivered { background: #dcfce7; color: #166534; }
        .status-cancelled { background: #fee2e2; color: #dc2626; }
        .notes-section {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
        }
        .footer {
            margin-top: 60px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
        }
        .footer p {
            margin: 8px 0;
        }
        .thank-you {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 20px;
        }
        @media print {
            body { background-color: white; padding: 0; }
            .invoice-container { box-shadow: none; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="company-info">
                <h1>Digital Catalogue</h1>
                <p><strong>Your Premium Digital Store</strong></p>
                <p>📱 Phone: +91 98765 43210</p>
                <p>📧 Email: info@digitalcatalogue.com</p>
                <p>🌐 Website: www.digitalcatalogue.com</p>
            </div>
            <div class="invoice-details">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${order.invoiceNumber}</p>
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                <p><strong>Status:</strong> 
                    <span class="status-badge status-${order.orderStatus}">${
    order.orderStatus
  }</span>
                </p>
            </div>
        </div>

        <div class="billing-section">
            <div class="billing-info">
                <h3>📋 Bill To:</h3>
                <p><strong>${
                  order.customerInfo?.name || "Guest Customer"
                }</strong></p>
                <p>📱 Phone: ${order.customerInfo?.phoneNumber}</p>
                ${
                  order.customerInfo?.email
                    ? `<p>📧 Email: ${order.customerInfo.email}</p>`
                    : ""
                }
                <p>💳 Payment: ${
                  order.paymentMethod === "cash_on_pickup"
                    ? "Cash on Pickup"
                    : "Prepaid"
                }</p>
                <p>🚚 Delivery: ${
                  order.deliveryType === "pickup"
                    ? "Store Pickup"
                    : "Home Delivery"
                }</p>
            </div>
            ${
              order.deliveryAddress
                ? `
            <div class="shipping-info">
                <h3>🚚 Ship To:</h3>
                <p>${order.deliveryAddress.street}</p>
                <p>${order.deliveryAddress.city}, ${
                    order.deliveryAddress.state
                  }</p>
                <p>📍 Pincode: ${order.deliveryAddress.pincode}</p>
                ${
                  order.estimatedDeliveryDate
                    ? `<p>📅 Est. Delivery: ${formatDate(
                        order.estimatedDeliveryDate
                      )}</p>`
                    : ""
                }
            </div>
            `
                : `
            <div class="shipping-info">
                <h3>🏪 Store Pickup</h3>
                <p><strong>Digital Catalogue Store</strong></p>
                <p>123 Main Street</p>
                <p>Your City, State</p>
                <p>📍 Pincode: 123456</p>
                ${
                  order.estimatedDeliveryDate
                    ? `<p>📅 Ready by: ${formatDate(
                        order.estimatedDeliveryDate
                      )}</p>`
                    : ""
                }
            </div>
            `
            }
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Weight (kg)</th>
                    <th class="amount">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items
                  .map(
                    (item: any) => `
                    <tr>
                        <td>
                            <strong>${
                              item.product?.name || "Unknown Product"
                            }</strong>
                            ${
                              item.product?.description
                                ? `<br><small style="color: #6b7280;">${item.product.description}</small>`
                                : ""
                            }
                        </td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.price)}</td>
                        <td>${item.weight || 0}</td>
                        <td class="amount">${formatCurrency(
                          item.totalPrice || item.price * item.quantity
                        )}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(
                  order.subtotal || order.totalAmount - (order.deliveryFee || 0)
                )}</span>
            </div>
            <div class="total-row">
                <span>Delivery Fee:</span>
                <span>${formatCurrency(order.deliveryFee || 0)}</span>
            </div>
            ${
              order.deliveryFee === 0
                ? `
            <div class="total-row" style="color: #059669;">
                <span>🎉 Free Delivery Applied</span>
                <span>-</span>
            </div>
            `
                : ""
            }
            <div class="total-row final">
                <span>TOTAL AMOUNT:</span>
                <span>${formatCurrency(order.totalAmount)}</span>
            </div>
        </div>

        <div style="clear: both;"></div>

        ${
          order.orderNotes
            ? `
        <div class="notes-section">
            <h3 style="margin: 0 0 10px 0; color: #374151;">📝 Order Notes:</h3>
            <p style="margin: 0;">${order.orderNotes}</p>
        </div>
        `
            : ""
        }

        <div class="footer">
            <p class="thank-you">Thank You for Your Business! 🙏</p>
            <p><strong>Payment Status:</strong> ${
              order.paymentStatus
            } | <strong>Order Status:</strong> ${order.orderStatus}</p>
            <p>For any queries, please contact us at +91 98765 43210 or info@digitalcatalogue.com</p>
            <p style="margin-top: 20px; font-size: 12px;">
                This is a computer-generated invoice. No signature required.<br>
                © ${new Date().getFullYear()} Digital Catalogue. All rights reserved.
            </p>
        </div>
    </div>

    <script>
        // Auto-print when opened for printing
        if (window.location.search.includes('print=true')) {
            window.print();
        }
    </script>
</body>
</html>`;
}
