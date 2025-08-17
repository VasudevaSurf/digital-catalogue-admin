"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Boxes,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["dashboard"]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/dashboard",
      subItems: [],
    },
    {
      id: "products",
      title: "Products",
      icon: <Package className="w-5 h-5" />,
      href: "/products",
      subItems: [
        { title: "All Products", href: "/products" },
        { title: "Add Product", href: "/products/add" },
        { title: "Categories", href: "/products/categories" },
      ],
    },
    {
      id: "orders",
      title: "Orders",
      icon: <ShoppingBag className="w-5 h-5" />,
      href: "/orders",
      subItems: [
        { title: "All Orders", href: "/orders" },
        { title: "Pending Orders", href: "/orders?status=pending" },
        {
          title: "Completed Orders",
          href: "/orders?status=delivered",
        },
      ],
    },
    {
      id: "inventory",
      title: "Inventory",
      icon: <Boxes className="w-5 h-5" />,
      href: "/inventory",
      subItems: [
        { title: "Stock Overview", href: "/inventory" },
        { title: "Low Stock Alerts", href: "/inventory/alerts" },
        { title: "Stock Movements", href: "/inventory/movements" },
      ],
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      href: "/analytics",
      subItems: [],
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">DC</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">Digital Catalogue</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            {/* Main Menu Item */}
            <div className="relative">
              <Link
                href={item.href}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={(e) => {
                  if (item.subItems.length > 0) {
                    e.preventDefault();
                    toggleMenu(item.id);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                {item.subItems.length > 0 && (
                  <div>
                    {expandedMenus.includes(item.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </Link>
            </div>

            {/* Sub Menu Items */}
            {item.subItems.length > 0 && expandedMenus.includes(item.id) && (
              <div className="ml-6 mt-2 space-y-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive(subItem.href)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
