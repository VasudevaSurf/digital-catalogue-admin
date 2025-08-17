"use client";

import { useState, useEffect } from "react";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TrendingUp, Users, Package, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [statsRes, salesRes] = await Promise.all([
        fetch("/api/admin/analytics/dashboard"),
        fetch(
          `/api/admin/analytics/sales?start=${dateRange.start}&end=${dateRange.end}`
        ),
      ]);

      const statsData = await statsRes.json();
      const salesData = await salesRes.json();

      if (statsData.success) setStats(statsData.data);
      if (salesData.success) setSalesData(salesData.data);
    } catch (error) {
      toast.error("Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">
          Business insights and performance metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats?.totalRevenue?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalOrders || 0}
              </p>
              <p className="text-sm text-green-600">+8.2% from last month</p>
            </div>
            <ShoppingBag className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalCustomers || 0}
              </p>
              <p className="text-sm text-green-600">+15.3% from last month</p>
            </div>
            <Users className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalProducts || 0}
              </p>
              <p className="text-sm text-green-600">+2.1% from last month</p>
            </div>
            <Package className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <SalesChart data={salesData} />

      {/* Additional Analytics Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          {/* Add TopProductsTable component */}
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
          {/* Add TopCustomersTable component */}
        </div>
      </div>
    </div>
  );
}
