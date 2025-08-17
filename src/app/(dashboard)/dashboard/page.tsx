"use client";

import { useEffect, useState } from "react";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { LowStockAlerts } from "@/components/dashboard/LowStockAlerts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all dashboard data in parallel
      const [statsRes, salesRes, ordersRes, alertsRes] = await Promise.all([
        fetch("/api/admin/analytics/dashboard"),
        fetch(
          "/api/admin/analytics/sales?start=" +
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() +
            "&end=" +
            new Date().toISOString()
        ),
        fetch("/api/admin/orders/recent?limit=5"),
        fetch("/api/admin/inventory/alerts"),
      ]);

      // Check if responses are ok
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setDashboardStats(statsData.data || statsData);
        }
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        if (salesData.success) {
          setSalesData(salesData.data || []);
        }
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.data || []);
        } else {
          setOrders(ordersData || []);
        }
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success) {
          setStockAlerts(alertsData.data || []);
        } else {
          setStockAlerts(alertsData || []);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={dashboardStats} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <SalesChart data={salesData} />
        </div>

        {/* Recent Orders */}
        <RecentOrders orders={orders} />

        {/* Low Stock Alerts */}
        <LowStockAlerts alerts={stockAlerts} />
      </div>
    </div>
  );
}
