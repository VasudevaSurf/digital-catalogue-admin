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
  Edit2,
  Save,
  X,
  CheckCircle2,
  Download,
} from "lucide-react";

interface OrderDetailsProps {
  order: any;
  onUpdate: () => void;
}

export function OrderDetails({ order, onUpdate }: OrderDetailsProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    order?.orderStatus || "pending"
  );
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!order) return null;

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.orderStatus) {
      setIsEditingStatus(false);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id || order._id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: selectedStatus,
            notes:
              statusNotes ||
              `Status updated from ${order.orderStatus} to ${selectedStatus}`,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        onUpdate();
        setIsEditingStatus(false);
        setStatusNotes("");
      } else {
        alert(result.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
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

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.invoiceNumber || order.orderId}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const cancelStatusEdit = () => {
    setSelectedStatus(order.orderStatus);
    setStatusNotes("");
    setIsEditingStatus(false);
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Order Summary with PDF Download */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
          <button
            onClick={handleDownloadInvoicePDF}
            disabled={isGeneratingPDF}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Generating PDF..." : "Download Invoice PDF"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Order Status</p>
            {isEditingStatus ? (
              <div className="mt-1 space-y-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Status update notes (optional)"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdatingStatus}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    {isUpdatingStatus ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelStatusEdit}
                    disabled={isUpdatingStatus}
                    className="flex items-center px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center space-x-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getOrderStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus}
                </span>
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit status"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
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
            {order.whatsappStatus && (
              <div>
                <p className="text-sm text-gray-600">WhatsApp Status</p>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.whatsappStatus === "sent"
                        ? "bg-green-100 text-green-800"
                        : order.whatsappStatus === "delivered"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.whatsappStatus}
                  </span>
                  {order.whatsappStatus === "sent" && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
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
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}
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
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(order.subtotal)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium">
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

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Status History
          </h3>
          <div className="space-y-3">
            {order.statusHistory.map((history: any, index: number) => (
              <div
                key={index}
                className="flex items-start space-x-3 border-l-2 border-blue-200 pl-4"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(
                        history.status
                      )}`}
                    >
                      {history.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(history.timestamp)}
                    </span>
                    {history.updatedBy && (
                      <span className="text-xs text-gray-400">
                        by {history.updatedBy}
                      </span>
                    )}
                  </div>
                  {history.notes && (
                    <p className="text-sm text-gray-600 mt-1">
                      {history.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
