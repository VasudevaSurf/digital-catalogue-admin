"use client";

import { useState } from "react";
import { SalesData } from "@/types/admin";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp } from "lucide-react";

interface SalesChartProps {
  data: SalesData[];
}

export function SalesChart({ data }: SalesChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [dataType, setDataType] = useState<"revenue" | "orders">("revenue");

  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {date.toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={`text-sm text-${entry.color}`}>
              {entry.name}:{" "}
              {dataType === "revenue"
                ? formatCurrency(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No sales data available
          </h3>
          <p className="text-gray-600">
            Sales data will appear here once you have orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sales Analytics
          </h3>
          <p className="text-sm text-gray-600">
            Track your revenue and order trends over time
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Data Type Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDataType("revenue")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                dataType === "revenue"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setDataType("orders")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                dataType === "orders"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Orders
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === "line"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === "bar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisTick}
                stroke="#666"
                fontSize={12}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickFormatter={
                  dataType === "revenue"
                    ? (value) => `₹${value / 1000}k`
                    : undefined
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={dataType}
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisTick}
                stroke="#666"
                fontSize={12}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                tickFormatter={
                  dataType === "revenue"
                    ? (value) => `₹${value / 1000}k`
                    : undefined
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={dataType} fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.reduce((sum, item) => sum + item.orders, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Average Order Value</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(
              data.reduce((sum, item) => sum + item.revenue, 0) /
                Math.max(
                  data.reduce((sum, item) => sum + item.orders, 0),
                  1
                )
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
