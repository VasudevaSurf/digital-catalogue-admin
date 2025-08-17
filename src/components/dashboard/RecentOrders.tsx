"use client";

import Link from "next/link";
import { Order } from "@/types/admin";
import {
  formatCurrency,
  formatDateTime,
  getOrderStatusColor,
} from "@/lib/utils";
import { Package, Eye, ArrowRight } from "lucide-react";

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (!orders.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No recent orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-600">Latest customer orders</p>
        </div>
        <Link
          href="/orders"
          className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">
                    #{order.invoiceNumber}
                  </p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-600">
                    {order.customerName || order.customerPhone}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </p>
                <p className="text-sm text-gray-500">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>

              <Link
                href={`/orders/${order.id}`}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
