"use client";

import { Order } from "@/types/admin";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
  getPaymentStatusColor,
} from "@/lib/utils";
import { Package, User, MapPin, Phone, CreditCard, Truck } from "lucide-react";

interface OrderDetailsProps {
  order: any;
  onUpdate: () => void;
}

export function OrderDetails({ order, onUpdate }: OrderDetailsProps) {
  if (!order) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${order._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update order status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Order Status</p>
            <select
              value={order.orderStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`mt-1 text-sm font-medium px-3 py-1 rounded-full ${getOrderStatusColor(
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
              <p className="font-medium">
                {order.customer?.name || order.customerId?.name || "Guest"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {order.customer?.phoneNumber || order.customerId?.phoneNumber}
              </p>
            </div>
            {order.customer?.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.customer.email}</p>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.productName || item.productId?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium">
                  Subtotal:
                </td>
                <td className="px-6 py-4 font-medium">
                  {formatCurrency(order.totalAmount - (order.deliveryFee || 0))}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-medium">
                  Delivery Fee:
                </td>
                <td className="px-6 py-4 font-medium">
                  {formatCurrency(order.deliveryFee || 0)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-bold">
                  Total:
                </td>
                <td className="px-6 py-4 font-bold text-lg">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Order Notes</h3>
          <p className="text-gray-700">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
