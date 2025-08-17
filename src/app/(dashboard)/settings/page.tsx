"use client";

import { useState } from "react";
import { ShopSettings } from "@/components/settings/ShopSettings";
import { DeliverySettings } from "@/components/settings/DeliverySettings";
import { PaymentSettings } from "@/components/settings/PaymentSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Store, Truck, CreditCard, Bell } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("shop");

  const tabs = [
    { id: "shop", label: "Shop Settings", icon: Store },
    { id: "delivery", label: "Delivery Settings", icon: Truck },
    { id: "payment", label: "Payment Settings", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your store settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "shop" && <ShopSettings />}
          {activeTab === "delivery" && <DeliverySettings />}
          {activeTab === "payment" && <PaymentSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
}
