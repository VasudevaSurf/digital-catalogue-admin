import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCurrentAdmin } from "@/lib/auth";
import { jsPDF } from "jspdf";

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

    // Generate PDF using jsPDF
    const pdf = generateInvoicePDF(order);
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${
          order.invoiceNumber || order.orderId
        }.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Generate PDF error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

function generateInvoicePDF(order: any): jsPDF {
  // Create new PDF document with proper encoding
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // Helper functions
  const formatCurrency = (amount: number) => {
    if (!amount) return "Rs. 0";
    return `Rs. ${amount.toLocaleString("en-IN")}`;
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Set up colors (RGB values)
  const primaryColor = [37, 99, 235]; // Blue
  const darkColor = [31, 41, 55]; // Dark gray
  const lightColor = [107, 114, 128]; // Light gray
  const whiteColor = [255, 255, 255];

  // Page setup
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Company Header Background
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, pageWidth, 50, "F");

  // Company Info
  pdf.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.text("DIGITAL CATALOGUE", margin, 20);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text("Your Premium Digital Store", margin, 30);
  pdf.text("Phone: +91 98765 43210", margin, 38);
  pdf.text("Email: info@digitalcatalogue.com", margin, 45);

  // Invoice Title
  pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  pdf.text("INVOICE", pageWidth - margin - 45, 25, { align: "right" });

  yPosition = 65;

  // Invoice Details Box
  pdf.setDrawColor(lightColor[0], lightColor[1], lightColor[2]);
  pdf.setFillColor(248, 249, 250);
  pdf.rect(pageWidth - 80, yPosition - 5, 60, 40, "FD");

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

  const invoiceDetails = [
    {
      label: "Invoice #:",
      value: order.invoiceNumber || order.orderId || "N/A",
    },
    { label: "Order ID:", value: order.orderId || "N/A" },
    { label: "Date:", value: formatDate(order.createdAt) },
    { label: "Status:", value: (order.orderStatus || "pending").toUpperCase() },
  ];

  invoiceDetails.forEach((detail, index) => {
    const lineY = yPosition + index * 8;
    pdf.text(detail.label, pageWidth - 75, lineY);
    pdf.setFont("helvetica", "normal");
    pdf.text(detail.value, pageWidth - 45, lineY);
    pdf.setFont("helvetica", "bold");
  });

  yPosition = 120;

  // Customer Information Section
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  pdf.text("BILL TO:", margin, yPosition);

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  yPosition += 8;

  const customerName =
    order.customerInfo?.name || order.customerName || "Guest Customer";
  const customerPhone =
    order.customerInfo?.phoneNumber || order.customerPhone || "N/A";
  const customerEmail = order.customerInfo?.email || order.customerEmail || "";

  const customerDetails = [
    customerName,
    `Phone: ${customerPhone}`,
    customerEmail ? `Email: ${customerEmail}` : null,
    `Payment: ${
      order.paymentMethod === "cash_on_pickup" ? "Cash on Pickup" : "Prepaid"
    }`,
    `Delivery: ${
      order.deliveryType === "pickup" ? "Store Pickup" : "Home Delivery"
    }`,
  ].filter(Boolean);

  customerDetails.forEach((detail) => {
    pdf.text(detail, margin, yPosition);
    yPosition += 7;
  });

  // Delivery Address (if applicable)
  if (order.deliveryAddress) {
    pdf.setFont("helvetica", "bold");
    pdf.text("SHIP TO:", pageWidth / 2, yPosition - 35);
    pdf.setFont("helvetica", "normal");

    const addressLines = [
      order.deliveryAddress.street,
      `${order.deliveryAddress.city}, ${order.deliveryAddress.state}`,
      `Pincode: ${order.deliveryAddress.pincode}`,
    ];

    addressLines.forEach((line, index) => {
      pdf.text(line, pageWidth / 2, yPosition - 28 + index * 7);
    });
  }

  yPosition += 20;

  // Items Table
  const tableStartY = yPosition;
  const tableHeight = 12;

  // Table Header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(margin, tableStartY, pageWidth - 2 * margin, tableHeight, "F");

  pdf.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");

  // Column headers
  const headers = [
    { text: "ITEM DESCRIPTION", x: margin + 3 },
    { text: "QTY", x: margin + 85 },
    { text: "PRICE", x: margin + 105 },
    { text: "WEIGHT", x: margin + 130 },
    { text: "TOTAL", x: pageWidth - margin - 25, align: "right" },
  ];

  headers.forEach((header) => {
    if (header.align === "right") {
      pdf.text(header.text, header.x, tableStartY + 8, { align: "right" });
    } else {
      pdf.text(header.text, header.x, tableStartY + 8);
    }
  });

  yPosition = tableStartY + tableHeight + 5;
  pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  pdf.setFont("helvetica", "normal");

  // Items
  let subtotal = 0;
  (order.items || []).forEach((item: any, index: number) => {
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    const itemTotal =
      item.totalPrice || (item.price || 0) * (item.quantity || 0);
    subtotal += itemTotal;

    // Alternate row background
    if (index % 2 === 0) {
      pdf.setFillColor(248, 249, 250);
      pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 10, "F");
    }

    // Item details
    const itemName =
      item.product?.name || item.productName || "Unknown Product";
    const truncatedName =
      itemName.length > 30 ? itemName.substring(0, 30) + "..." : itemName;

    pdf.text(truncatedName, margin + 3, yPosition + 3);
    pdf.text((item.quantity || 0).toString(), margin + 85, yPosition + 3);
    pdf.text(formatCurrency(item.price || 0), margin + 105, yPosition + 3);
    pdf.text(`${item.weight || 0}kg`, margin + 130, yPosition + 3);
    pdf.text(formatCurrency(itemTotal), pageWidth - margin - 3, yPosition + 3, {
      align: "right",
    });

    yPosition += 10;
  });

  // Totals Section
  yPosition += 10;
  const totalsStartX = pageWidth - 70;
  const totalsWidth = 50;

  // Totals box background
  pdf.setFillColor(248, 249, 250);
  pdf.rect(totalsStartX, yPosition - 5, totalsWidth, 45, "F");
  pdf.setDrawColor(lightColor[0], lightColor[1], lightColor[2]);
  pdf.rect(totalsStartX, yPosition - 5, totalsWidth, 45, "S");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  // Subtotal
  pdf.text("Subtotal:", totalsStartX + 3, yPosition + 3);
  pdf.text(
    formatCurrency(order.subtotal || subtotal),
    totalsStartX + totalsWidth - 3,
    yPosition + 3,
    { align: "right" }
  );
  yPosition += 8;

  // Delivery Fee
  pdf.text("Delivery Fee:", totalsStartX + 3, yPosition + 3);
  pdf.text(
    formatCurrency(order.deliveryFee || 0),
    totalsStartX + totalsWidth - 3,
    yPosition + 3,
    { align: "right" }
  );
  yPosition += 8;

  // Free Delivery Notice
  if ((order.deliveryFee || 0) === 0) {
    pdf.setTextColor(5, 150, 105);
    pdf.setFontSize(9);
    pdf.text("Free Delivery Applied", totalsStartX + 3, yPosition + 3);
    pdf.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    yPosition += 8;
  }

  // Total line
  pdf.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
  pdf.line(
    totalsStartX + 3,
    yPosition,
    totalsStartX + totalsWidth - 3,
    yPosition
  );
  yPosition += 6;

  // Total Amount
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("TOTAL:", totalsStartX + 3, yPosition + 3);
  pdf.text(
    formatCurrency(order.totalAmount || 0),
    totalsStartX + totalsWidth - 3,
    yPosition + 3,
    { align: "right" }
  );

  yPosition += 20;

  // Order Notes
  if (order.orderNotes) {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("ORDER NOTES:", margin, yPosition);
    yPosition += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const splitNotes = pdf.splitTextToSize(
      order.orderNotes,
      pageWidth - 2 * margin
    );
    pdf.text(splitNotes, margin, yPosition);
    yPosition += splitNotes.length * 5;
  }

  // Footer
  const footerY = pageHeight - 35;
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, footerY, pageWidth, 35, "F");

  pdf.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Thank You for Your Business!", pageWidth / 2, footerY + 12, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(
    "For any queries, contact us at +91 98765 43210 or info@digitalcatalogue.com",
    pageWidth / 2,
    footerY + 20,
    { align: "center" }
  );
  pdf.text(
    `© ${new Date().getFullYear()} Digital Catalogue. All rights reserved.`,
    pageWidth / 2,
    footerY + 28,
    { align: "center" }
  );

  return pdf;
}
