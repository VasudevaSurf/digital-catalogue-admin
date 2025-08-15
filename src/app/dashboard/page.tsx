// src/app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchDashboardStats,
  fetchSalesData,
} from "@/store/slices/adminAnalyticsSlice";
import { fetchRecentOrders } from "@/store/slices/adminOrderSlice";
import { fetchLowStockAlerts } from "@/store/slices/adminInventorySlice";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { LowStockAlerts } from "@/components/dashboard/LowStockAlerts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { dashboardStats, salesData, isLoading } = useAppSelector(
    (state) => state.adminAnalytics
  );
  const { orders } = useAppSelector((state) => state.adminOrders);
  const { stockAlerts } = useAppSelector((state) => state.adminInventory);

  useEffect(() => {
    // Load dashboard data
    dispatch(fetchDashboardStats());
    dispatch(
      fetchSalesData({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        end: new Date().toISOString(),
      })
    );
    dispatch(fetchRecentOrders({ limit: 5 }));
    dispatch(fetchLowStockAlerts());
  }, [dispatch]);

  if (isLoading && !dashboardStats) {
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
      {dashboardStats && <StatsGrid stats={dashboardStats} />}

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <SalesChart data={salesData} />
        </div>

        {/* Recent Orders */}
        <RecentOrders orders={orders.slice(0, 5)} />

        {/* Low Stock Alerts */}
        <LowStockAlerts alerts={stockAlerts} />
      </div>
    </div>
  );
}
