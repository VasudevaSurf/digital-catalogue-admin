"use client";

import Link from "next/link";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getPaymentStatusColor,
} from "@/lib/utils";
import { Eye, Edit, Trash2, MessageSquare } from "lucide-react";

interface OrdersTableProps {
  orders: any[];
  onStatusUpdate: (orderId: string, status: string) => void;
}

export function OrdersTable({ orders, onStatusUpdate }: OrdersTableProps) {
  if (!orders.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No orders found</p>
      </div>
    );
  }

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
        // Refresh the page or remove from state
        window.location.reload();
      } else {
        alert(result.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("Failed to delete order");
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
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => onStatusUpdate(orderId, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 ${getOrderStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
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
