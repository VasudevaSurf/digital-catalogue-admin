"use client";

import Link from "next/link";
import { Plus, Package, ShoppingBag, BarChart3, Boxes } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Add Product",
      description: "Add a new product to your inventory",
      href: "/products/add",
      icon: <Plus className="w-6 h-6" />,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Manage Orders",
      description: "View and process customer orders",
      href: "/orders",
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Inventory",
      description: "Check stock levels and alerts",
      href: "/inventory",
      icon: <Boxes className="w-6 h-6" />,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "View Analytics",
      description: "Check sales and performance metrics",
      href: "/analytics",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600">Common tasks and shortcuts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`${action.color} text-white p-4 rounded-lg transition-colors group`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">{action.icon}</div>
              <div>
                <h4 className="font-semibold">{action.title}</h4>
                <p className="text-sm opacity-90 mt-1">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
