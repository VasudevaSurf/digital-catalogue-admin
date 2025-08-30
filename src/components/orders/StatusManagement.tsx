"use client";

import { useState } from "react";
import {
  formatDateTime,
  getOrderStatusColor,
  getPaymentStatusColor,
} from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  CreditCard,
  User,
  MessageSquare,
} from "lucide-react";

interface StatusManagementProps {
  order: any;
  onOrderStatusUpdate: (status: string, notes: string) => Promise<void>;
  onPaymentStatusUpdate: (status: string, notes: string) => Promise<void>;
}

export function StatusManagement({
  order,
  onOrderStatusUpdate,
  onPaymentStatusUpdate,
}: StatusManagementProps) {
  const [activeTab, setActiveTab] = useState<"order" | "payment">("order");

  // Only 3 order status options as requested
  const orderStatusOptions = [
    {
      value: "confirmed",
      label: "Confirmed",
      icon: CheckCircle2,
      color: "blue",
    },
    {
      value: "delivered",
      label: "Delivered",
      icon: CheckCircle2,
      color: "green",
    },
    { value: "cancelled", label: "Cancelled", icon: XCircle, color: "red" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Pending", icon: Clock, color: "yellow" },
    {
      value: "completed",
      label: "Completed",
      icon: CheckCircle2,
      color: "green",
    },
    { value: "failed", label: "Failed", icon: XCircle, color: "red" },
  ];

  const getAvailableOrderStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case "confirmed":
        return orderStatusOptions; // Can go to delivered or cancelled
      case "delivered":
        return [orderStatusOptions.find((opt) => opt.value === "delivered")!]; // Cannot change from delivered
      case "cancelled":
        return [orderStatusOptions.find((opt) => opt.value === "cancelled")!]; // Cannot change from cancelled
      default:
        return orderStatusOptions;
    }
  };

  const getStatusHistory = (type: "order" | "payment") => {
    if (!order.statusHistory) return [];

    return order.statusHistory
      .filter((entry: any) => {
        if (type === "payment") {
          return entry.type === "payment" || entry.status.includes("payment");
        }
        return entry.type !== "payment" && !entry.status.includes("payment");
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  };

  const handleQuickStatusUpdate = async (
    status: string,
    type: "order" | "payment"
  ) => {
    const notes = `Quick ${type} status update to ${status}`;

    if (type === "order") {
      await onOrderStatusUpdate(status, notes);
    } else {
      await onPaymentStatusUpdate(status, notes);
    }
  };

  const renderStatusTimeline = (type: "order" | "payment") => {
    const history = getStatusHistory(type);
    const statusOptions =
      type === "order" ? orderStatusOptions : paymentStatusOptions;
    const currentStatus =
      type === "order" ? order.orderStatus : order.paymentStatus;
    const availableStatuses =
      type === "order"
        ? getAvailableOrderStatuses(currentStatus)
        : paymentStatusOptions;

    return (
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Quick {type === "order" ? "Order" : "Payment"} Status Update
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableStatuses.map((option) => {
              const Icon = option.icon;
              const isCurrentStatus = currentStatus === option.value;
              const isDisabled =
                type === "order" &&
                (currentStatus === "delivered" ||
                  currentStatus === "cancelled") &&
                currentStatus !== option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleQuickStatusUpdate(option.value, type)}
                  disabled={isCurrentStatus || isDisabled}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isCurrentStatus
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : isDisabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border hover:bg-gray-50 text-gray-700"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {option.label}
                  {isCurrentStatus && (
                    <span className="ml-2 text-xs">(Current)</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Status Flow Info for Orders */}
          {type === "order" && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
              <strong>Status Flow:</strong> Confirmed → Delivered (or Cancelled)
              <div className="mt-1">
                • Orders start as <strong>Confirmed</strong>
                <br />• Can be changed to <strong>Delivered</strong> when
                completed
                <br />• Can be <strong>Cancelled</strong> if needed
                <br />• Delivered and Cancelled orders cannot be changed
              </div>
            </div>
          )}
        </div>

        {/* Status History */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {type === "order" ? "Order" : "Payment"} Status History
          </h4>

          {history.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No {type} status history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry: any, index: number) => {
                const statusOption = statusOptions.find(
                  (opt) =>
                    opt.value === entry.status ||
                    entry.status.includes(opt.value)
                );
                const Icon = statusOption?.icon || Clock;
                const isLatest = index === 0;

                return (
                  <div
                    key={`${entry.timestamp}-${index}`}
                    className={`
                      flex items-start space-x-3 p-4 rounded-lg border-l-4 
                      ${
                        isLatest
                          ? "bg-blue-50 border-l-blue-500"
                          : "bg-gray-50 border-l-gray-300"
                      }
                    `}
                  >
                    <div
                      className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      ${
                        isLatest
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`
                            px-2 py-1 text-xs font-medium rounded-full
                            ${
                              type === "order"
                                ? getOrderStatusColor(entry.status)
                                : getPaymentStatusColor(entry.status)
                            }
                          `}
                          >
                            {entry.status}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(entry.timestamp)}
                        </span>
                      </div>

                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          {entry.notes}
                        </p>
                      )}

                      {entry.updatedBy && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <User className="w-3 h-3 mr-1" />
                          <span>Updated by {entry.updatedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab("order")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === "order"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Order Status
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === "payment"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Payment Status
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Current Status Overview */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Current Order Status
              </span>
              <span
                className={`
                px-3 py-1 text-sm font-medium rounded-full
                ${getOrderStatusColor(order.orderStatus)}
              `}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Current Payment Status
              </span>
              <span
                className={`
                px-3 py-1 text-sm font-medium rounded-full
                ${getPaymentStatusColor(order.paymentStatus)}
              `}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Status Management Content */}
        {renderStatusTimeline(activeTab)}
      </div>

      {/* Status Flow Guide */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-start space-x-4">
          <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              Simple Status Flow
            </h4>
            <div className="text-xs text-gray-600 mt-1 space-y-1">
              <p>
                <strong>Order:</strong> Confirmed → Delivered (or Cancelled)
              </p>
              <p>
                <strong>Payment:</strong> Pending → Completed (or Failed)
              </p>
              <p>• Orders are created as "Confirmed" by default</p>
              <p>
                • Once "Delivered" or "Cancelled", order status cannot be
                changed
              </p>
              <p>• Payment status can be updated independently</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
