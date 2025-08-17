"use client";

import { DashboardStats } from "@/types/admin";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
} from "lucide-react";

interface StatsGridProps {
  stats: DashboardStats | null;
}

export function StatsGrid({ stats }: StatsGridProps) {
  // Handle null or undefined stats
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Revenue",
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      change: "+12.5%",
      trend: "up" as const,
      icon: <DollarSign className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: (stats.totalOrders || 0).toString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Customers",
      value: (stats.totalCustomers || 0).toString(),
      change: "+15.3%",
      trend: "up" as const,
      icon: <Users className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Products",
      value: (stats.totalProducts || 0).toString(),
      change: "+2.1%",
      trend: "up" as const,
      icon: <Package className="w-6 h-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item, index) => (
        <div
          key={item.title}
          className="bg-white rounded-lg shadow-sm p-6"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{item.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {item.value}
              </p>
              <div className="flex items-center mt-2">
                {item.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    item.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            </div>
            <div className={`${item.bgColor} ${item.color} p-3 rounded-lg`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
