// src/app/api/admin/orders/[id]/invoice/route.ts
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

    // Generate HTML invoice
    const invoiceHTML = generateInvoiceHTML(order);

    // Return HTML that can be opened in browser and printed
    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="invoice-${order.invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error("Generate invoice error:", error);
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

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${order.invoiceNumber}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #eee;
                padding-bottom: 20px;
            }
            .company-info h1 {
                color: #2563eb;
                margin: 0;
            }
            .invoice-details {
                text-align: right;
            }
            .invoice-details h2 {
                color: #dc2626;
                margin: 0;
            }
            .billing-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .billing-info, .shipping-info {
                width: 45%;
            }
            .billing-info h3, .shipping-info h3 {
                color: #374151;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 5px;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .items-table th,
            .items-table td {
                border: 1px solid #e5e7eb;
                padding: 12px;
                text-align: left;
            }
            .items-table th {
                background-color: #f9fafb;
                font-weight: bold;
            }
            .items-table .amount {
                text-align: right;
            }
            .total-section {
                float: right;
                width: 300px;
                margin-top: 20px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .total-row.final {
                font-weight: bold;
                font-size: 1.2em;
                border-bottom: 2px solid #374151;
            }
            .footer {
                margin-top: 50px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
            @media print {
                body { padding: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-header">
            <div class="company-info">
                <h1>Digital Catalogue</h1>
                <p>Your Digital Store<br>
                Phone: +91 98765 43210<br>
                Email: info@digitalcatalogue.com</p>
            </div>
            <div class="invoice-details">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${order.invoiceNumber}</p>
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                <p><strong>Status:</strong> <span style="text-transform: capitalize;">${
                  order.orderStatus
                }</span></p>
            </div>
        </div>

        <div class="billing-section">
            <div class="billing-info">
                <h3>Bill To:</h3>
                <p><strong>${order.customerInfo?.name || "Guest"}</strong></p>
                <p>Phone: ${order.customerInfo?.phoneNumber}</p>
                ${
                  order.customerInfo?.email
                    ? `<p>Email: ${order.customerInfo.email}</p>`
                    : ""
                }
            </div>
            ${
              order.deliveryAddress
                ? `
            <div class="shipping-info">
                <h3>Ship To:</h3>
                <p>${order.deliveryAddress.street}</p>
                <p>${order.deliveryAddress.city}, ${order.deliveryAddress.state}</p>
                <p>Pincode: ${order.deliveryAddress.pincode}</p>
            </div>
            `
                : ""
            }
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Weight</th>
                    <th class="amount">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items
                  .map(
                    (item: any) => `
                    <tr>
                        <td>${item.product?.name || "Unknown Product"}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.price)}</td>
                        <td>${item.weight}kg</td>
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
            <div class="total-row final">
                <span>Total:</span>
                <span>${formatCurrency(order.totalAmount)}</span>
            </div>
        </div>

        <div style="clear: both;"></div>

        ${
          order.orderNotes
            ? `
        <div style="margin-top: 30px;">
            <h3>Notes:</h3>
            <p>${order.orderNotes}</p>
        </div>
        `
            : ""
        }

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>Payment Method: ${
              order.paymentMethod === "cash_on_pickup"
                ? "Cash on Pickup"
                : "Prepaid"
            }</p>
            <p>Delivery Type: ${
              order.deliveryType === "pickup" ? "Store Pickup" : "Home Delivery"
            }</p>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Print Invoice</button>
            <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
    </body>
    </html>
  `;
}
