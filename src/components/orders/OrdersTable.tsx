"use client";

import Link from "next/link";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getPaymentStatusColor,
} from "@/lib/utils";
import { Eye, Edit, Trash2, MessageSquare, Check, X } from "lucide-react";
import { useState } from "react";

interface OrdersTableProps {
  orders: any[];
  onStatusUpdate: (orderId: string, status: string) => void;
  onPaymentStatusUpdate?: (orderId: string, paymentStatus: string) => void;
}

export function OrdersTable({
  orders,
  onStatusUpdate,
  onPaymentStatusUpdate,
}: OrdersTableProps) {
  const [editingStatus, setEditingStatus] = useState<{
    orderId: string;
    type: "order" | "payment";
  } | null>(null);
  const [tempStatus, setTempStatus] = useState<string>("");

  if (!orders.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No orders found</p>
      </div>
    );
  }

  // Only 3 order status options as requested
  const orderStatusOptions = [
    { value: "confirmed", label: "Confirmed" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ];

  const handleDeleteOrder = async (orderId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        window.location.reload();
      } else {
        alert(result.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete order");
    }
  };

  const handleStatusEdit = (
    orderId: string,
    currentStatus: string,
    type: "order" | "payment"
  ) => {
    setEditingStatus({ orderId, type });
    setTempStatus(currentStatus);
  };

  const handleStatusSave = async () => {
    if (!editingStatus) return;

    const { orderId, type } = editingStatus;

    try {
      if (type === "order") {
        await onStatusUpdate(orderId, tempStatus);
      } else if (type === "payment" && onPaymentStatusUpdate) {
        await onPaymentStatusUpdate(orderId, tempStatus);
      }

      setEditingStatus(null);
      setTempStatus("");
    } catch (error) {
      console.error(`Failed to update ${type} status:`, error);
    }
  };

  const handleStatusCancel = () => {
    setEditingStatus(null);
    setTempStatus("");
  };

  const getStatusOptions = (type: "order" | "payment") => {
    return type === "order" ? orderStatusOptions : paymentStatusOptions;
  };

  // For order status, allow transitions based on current status
  const getAvailableOrderStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case "confirmed":
        return orderStatusOptions; // Can go to delivered or cancelled
      case "delivered":
        return [{ value: "delivered", label: "Delivered" }]; // Cannot change from delivered
      case "cancelled":
        return [{ value: "cancelled", label: "Cancelled" }]; // Cannot change from cancelled
      default:
        return orderStatusOptions;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => {
            const orderId = order._id || order.id;
            const customerName =
              order.customerInfo?.name || order.customerName || "Guest";
            const customerPhone =
              order.customerInfo?.phoneNumber || order.customerPhone;

            const isEditingOrderStatus =
              editingStatus?.orderId === orderId &&
              editingStatus.type === "order";
            const isEditingPaymentStatus =
              editingStatus?.orderId === orderId &&
              editingStatus.type === "payment";

            return (
              <tr key={orderId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      #{order.invoiceNumber}
                    </div>
                    <div className="text-xs text-gray-500">{order.orderId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customerName}</div>
                  <div className="text-sm text-gray-500">{customerPhone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  {order.items && (
                    <div className="text-xs text-gray-500">
                      {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </div>
                  )}
                </td>

                {/* Order Status Column - Only 3 options */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditingOrderStatus ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {getAvailableOrderStatuses(order.orderStatus).map(
                          (option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        onClick={handleStatusSave}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleStatusCancel}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        handleStatusEdit(orderId, order.orderStatus, "order")
                      }
                      disabled={
                        order.orderStatus === "delivered" ||
                        order.orderStatus === "cancelled"
                      }
                      className={`px-2 py-1 text-xs font-medium rounded-full hover:opacity-80 transition-opacity ${getOrderStatusColor(
                        order.orderStatus
                      )} ${
                        order.orderStatus === "delivered" ||
                        order.orderStatus === "cancelled"
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                      title={
                        order.orderStatus === "delivered" ||
                        order.orderStatus === "cancelled"
                          ? "Cannot modify this status"
                          : "Click to edit status"
                      }
                    >
                      {order.orderStatus}
                    </button>
                  )}
                </td>

                {/* Payment Status Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditingPaymentStatus ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={tempStatus}
                        onChange={(e) => setTempStatus(e.target.value)}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {paymentStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleStatusSave}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleStatusCancel}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        handleStatusEdit(
                          orderId,
                          order.paymentStatus,
                          "payment"
                        )
                      }
                      className={`px-2 py-1 text-xs font-medium rounded-full hover:opacity-80 transition-opacity cursor-pointer ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                      title="Click to edit payment status"
                    >
                      {order.paymentStatus}
                    </button>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">
                    {order.deliveryType}
                  </div>
                  {order.whatsappStatus && (
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        {order.whatsappStatus}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{formatDateTime(order.createdAt)}</div>
                  {order.estimatedDeliveryDate && (
                    <div className="text-xs text-gray-400">
                      Est: {formatDateTime(order.estimatedDeliveryDate)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/orders/${orderId}`}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteOrder(orderId)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
