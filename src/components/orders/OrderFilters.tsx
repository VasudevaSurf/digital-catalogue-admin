"use client";

import { OrderFilter } from "@/types/admin";

interface OrderFiltersProps {
  filters: OrderFilter;
  onChange: (filters: OrderFilter) => void;
}

export function OrderFilters({ filters, onChange }: OrderFiltersProps) {
  const handleChange = (key: keyof OrderFilter, value: any) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Order Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Order Status
        </label>
        <select
          value={filters.status?.[0] || ""}
          onChange={(e) =>
            handleChange("status", e.target.value ? [e.target.value] : [])
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Payment Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Status
        </label>
        <select
          value={filters.paymentStatus?.[0] || ""}
          onChange={(e) =>
            handleChange(
              "paymentStatus",
              e.target.value ? [e.target.value] : []
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Delivery Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Type
        </label>
        <select
          value={filters.deliveryType?.[0] || ""}
          onChange={(e) =>
            handleChange("deliveryType", e.target.value ? [e.target.value] : [])
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="delivery">Delivery</option>
          <option value="pickup">Pickup</option>
        </select>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        <div className="flex space-x-2">
          <input
            type="date"
            value={filters.dateRange?.start || ""}
            onChange={(e) =>
              handleChange("dateRange", {
                ...filters.dateRange,
                start: e.target.value,
              })
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={filters.dateRange?.end || ""}
            onChange={(e) =>
              handleChange("dateRange", {
                ...filters.dateRange,
                end: e.target.value,
              })
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
