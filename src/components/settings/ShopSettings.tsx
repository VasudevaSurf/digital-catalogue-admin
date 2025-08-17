"use client";

import { useState, useEffect } from "react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import toast from "react-hot-toast";

export function ShopSettings() {
  const [formData, setFormData] = useState({
    shopName: "",
    shopAddress: "",
    phoneNumber: "",
    email: "",
    workingHours: {
      monday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
      tuesday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
      wednesday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
      thursday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
      friday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
      saturday: { isOpen: true, openTime: "09:00", closeTime: "21:00" },
      sunday: { isOpen: false, openTime: "09:00", closeTime: "21:00" },
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/shop");
      const data = await response.json();
      if (data.success && data.data) {
        setFormData(data.data);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/settings/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Settings updated successfully");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      toast.error("Error updating settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: {
          ...formData.workingHours[day as keyof typeof formData.workingHours],
          [field]: value,
        },
      },
    });
  };

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Name
          </label>
          <input
            type="text"
            value={formData.shopName}
            onChange={(e) =>
              setFormData({ ...formData, shopName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Address
          </label>
          <textarea
            value={formData.shopAddress}
            onChange={(e) =>
              setFormData({ ...formData, shopAddress: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Working Hours
        </h3>
        <div className="space-y-2">
          {days.map((day) => (
            <div
              key={day}
              className="flex items-center space-x-4 p-3 border rounded-lg"
            >
              <div className="w-24">
                <span className="text-sm font-medium capitalize">{day}</span>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    formData.workingHours[
                      day as keyof typeof formData.workingHours
                    ].isOpen
                  }
                  onChange={(e) =>
                    handleWorkingHoursChange(day, "isOpen", e.target.checked)
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Open</span>
              </label>
              {formData.workingHours[day as keyof typeof formData.workingHours]
                .isOpen && (
                <>
                  <input
                    type="time"
                    value={
                      formData.workingHours[
                        day as keyof typeof formData.workingHours
                      ].openTime
                    }
                    onChange={(e) =>
                      handleWorkingHoursChange(day, "openTime", e.target.value)
                    }
                    className="px-3 py-1 border border-gray-300 rounded"
                  />
                  <span className="text-sm">to</span>
                  <input
                    type="time"
                    value={
                      formData.workingHours[
                        day as keyof typeof formData.workingHours
                      ].closeTime
                    }
                    onChange={(e) =>
                      handleWorkingHoursChange(day, "closeTime", e.target.value)
                    }
                    className="px-3 py-1 border border-gray-300 rounded"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Settings
        </LoadingButton>
      </div>
    </form>
  );
}
