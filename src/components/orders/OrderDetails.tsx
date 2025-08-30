"use client";

import { useState } from "react";
import { Order } from "@/types/admin";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getPaymentStatusColor,
} from "@/lib/utils";
import {
  Package,
  User,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Clock,
  MessageSquare,
  Download,
  Settings,
} from "lucide-react";
import { StatusManagement } from "@/components/orders/StatusManagement";

interface OrderDetailsProps {
  order: any;
  onUpdate: () => void;
}

export function OrderDetails({ order, onUpdate }: OrderDetailsProps) {
  const [activeSection, setActiveSection] = useState<"overview" | "status">(
    "overview"
  );
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!order) return null;

  const handleOrderStatusUpdate = async (status: string, notes: string) => {
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id || order._id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, notes }),
        }
      );

      const result = await response.json();

      if (result.success) {
        onUpdate();
      } else {
        throw new Error(result.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      throw error;
    }
  };

  const handlePaymentStatusUpdate = async (
    paymentStatus: string,
    notes: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id || order._id}/payment-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus, notes }),
        }
      );

      const result = await response.json();

      if (result.success) {
        onUpdate();
      } else {
        throw new Error(result.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
      throw error;
    }
  };

  const handleDownloadInvoicePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const orderId = order.id || order._id;
      const response = await fetch(`/api/admin/orders/${orderId}/invoice/pdf`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.invoiceNumber || order.orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order #{order.invoiceNumber}
            </h2>
            <p className="text-gray-600">Manage order details and status</p>
          </div>
          <button
            onClick={handleDownloadInvoicePDF}
            disabled={isGeneratingPDF}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Generating PDF..." : "Download Invoice"}
          </button>
        </div>

        {/* Section Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveSection("overview")}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeSection === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Order Overview
            </button>
            <button
              onClick={() => setActiveSection("status")}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeSection === "status"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Status Management
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active section */}
      {activeSection === "overview" ? (
        <>
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <span
                  className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <span
                  className={`mt-1 inline-block px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(
                    order.paymentStatus
                  )}`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="mt-1 text-lg font-bold">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{order.customerName || "Guest"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {order.customerPhone}
                  </p>
                </div>
                {order.customerEmail && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{order.customerEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Delivery Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">{order.deliveryType}</p>
                </div>
                {order.deliveryAddress && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <div className="font-medium">
                      <p>{order.deliveryAddress.street}</p>
                      <p>
                        {order.deliveryAddress.city},{" "}
                        {order.deliveryAddress.state}
                      </p>
                      <p>Pincode: {order.deliveryAddress.pincode}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Delivery Fee</p>
                  <p className="font-medium">
                    {formatCurrency(order.deliveryFee || 0)}
                  </p>
                </div>
                {order.estimatedDeliveryDate && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDateTime(order.estimatedDeliveryDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.name ||
                            item.productName ||
                            "Unknown Product"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(
                          item.totalPrice || item.price * item.quantity
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.weight ? `${item.weight}kg` : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  {order.subtotal && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-right font-medium"
                      >
                        Subtotal:
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(order.subtotal)}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-right font-medium"
                    >
                      Delivery Fee:
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(order.deliveryFee || 0)}
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-bold">
                      Total:
                    </td>
                    <td className="px-6 py-4 font-bold text-lg">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {order.totalWeight ? `${order.totalWeight}kg` : ""}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Order Notes
              </h3>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </>
      ) : (
        /* Status Management Section */
        <StatusManagement
          order={order}
          onOrderStatusUpdate={handleOrderStatusUpdate}
          onPaymentStatusUpdate={handlePaymentStatusUpdate}
        />
      )}
    </div>
  );
}
