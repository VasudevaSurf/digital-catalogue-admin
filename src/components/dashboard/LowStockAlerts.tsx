"use client";

import Link from "next/link";
import { StockAlert } from "@/types/admin";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";

interface LowStockAlertsProps {
  alerts: StockAlert[];
}

export function LowStockAlerts({ alerts }: LowStockAlertsProps) {
  const activeAlerts = alerts.filter((alert) => alert.isActive);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Low Stock Alerts
          </h3>
          <p className="text-sm text-gray-600">Products running low on stock</p>
        </div>
        <Link
          href="/dashboard/inventory/alerts"
          className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* Alerts List */}
      {activeAlerts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No low stock alerts</p>
          <p className="text-sm text-gray-500 mt-1">
            All products are well stocked
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAlerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {alert.product.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Only {alert.currentStock} left (threshold: {alert.threshold}
                    )
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  {alert.currentStock === 0 ? "Out of Stock" : "Low Stock"}
                </span>
                <Link
                  href={`/dashboard/products/${alert.product.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Update
                </Link>
              </div>
            </div>
          ))}

          {activeAlerts.length > 5 && (
            <div className="text-center pt-2">
              <Link
                href="/dashboard/inventory/alerts"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                and {activeAlerts.length - 5} more alerts...
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
