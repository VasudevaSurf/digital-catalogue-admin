"use client";

import { useState, useEffect } from "react";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Download, Filter } from "lucide-react";
import toast from "react-hot-toast";

interface OrderFilter {
  status?: string;
  paymentStatus?: string;
  deliveryType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OrderFilter>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
      });

      // Add filters to params
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.paymentStatus) {
        params.append("paymentStatus", filters.paymentStatus);
      }
      if (filters.deliveryType) {
        params.append("deliveryType", filters.deliveryType);
      }
      if (filters.dateRange?.start) {
        params.append("startDate", filters.dateRange.start);
      }
      if (filters.dateRange?.end) {
        params.append("endDate", filters.dateRange.end);
      }

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, searchQuery, filters]);

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order status updated");
        fetchOrders(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentStatusUpdate = async (
    orderId: string,
    paymentStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/payment-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Payment status updated");
        fetchOrders(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.paymentStatus)
        params.append("paymentStatus", filters.paymentStatus);
      if (filters.deliveryType)
        params.append("deliveryType", filters.deliveryType);
      if (filters.dateRange?.start)
        params.append("startDate", filters.dateRange.start);
      if (filters.dateRange?.end)
        params.append("endDate", filters.dateRange.end);

      const response = await fetch(`/api/admin/orders/export?${params}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        toast.error("Failed to export orders");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export orders");
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFiltersChange = (newFilters: OrderFilter) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page when filters change
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">
            Manage customer orders with simple status updates
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Quick Stats - Only for the 3 status options */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900">
            {pagination.total}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Confirmed Orders</div>
          <div className="text-2xl font-bold text-blue-600">
            {
              orders.filter((order: any) => order.orderStatus === "confirmed")
                .length
            }
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Delivered Orders</div>
          <div className="text-2xl font-bold text-green-600">
            {
              orders.filter((order: any) => order.orderStatus === "delivered")
                .length
            }
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">Cancelled Orders</div>
          <div className="text-2xl font-bold text-red-600">
            {
              orders.filter((order: any) => order.orderStatus === "cancelled")
                .length
            }
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search orders by ID, customer name, or phone..."
            className="max-w-md"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <OrderFilters filters={filters} onChange={handleFiltersChange} />
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            <OrdersTable
              orders={orders}
              onStatusUpdate={handleOrderStatusUpdate}
              onPaymentStatusUpdate={handlePaymentStatusUpdate}
            />
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Simple Status Management Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          Simple Status Management
        </h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <strong>Order Status:</strong> Confirmed → Delivered (or Cancelled)
          </p>
          <p>
            <strong>Payment Status:</strong> Pending → Completed (or Failed)
          </p>
          <p>• All orders start as "Confirmed" when placed</p>
          <p>• Click on any status badge to edit it directly</p>
          <p>
            • Once "Delivered" or "Cancelled", order status cannot be changed
          </p>
          <p>• Payment status can always be updated independently</p>
        </div>
      </div>
    </div>
  );
}
