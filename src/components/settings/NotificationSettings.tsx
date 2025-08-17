"use client";

import { useState } from "react";
import { LoadingButton } from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

export function NotificationSettings() {
  const [formData, setFormData] = useState({
    emailNotifications: {
      newOrder: true,
      orderStatusChange: true,
      lowStock: true,
      newCustomer: false,
      dailyReport: false,
    },
    smsNotifications: {
      newOrder: false,
      orderStatusChange: false,
      lowStock: false,
    },
    whatsappNotifications: {
      orderConfirmation: true,
      orderStatusUpdate: true,
      deliveryNotification: true,
    },
    notificationChannels: {
      email: {
        enabled: true,
        emailAddress: "",
      },
      sms: {
        enabled: false,
        phoneNumber: "",
      },
      whatsapp: {
        enabled: true,
        phoneNumber: "",
      },
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save notification settings
      toast.success("Notification settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notification Channels */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Notification Channels
        </h3>
        <div className="space-y-4">
          {/* Email Channel */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={formData.notificationChannels.email.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationChannels: {
                      ...formData.notificationChannels,
                      email: {
                        ...formData.notificationChannels.email,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 font-medium">Email Notifications</span>
            </label>
            {formData.notificationChannels.email.enabled && (
              <input
                type="email"
                value={formData.notificationChannels.email.emailAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationChannels: {
                      ...formData.notificationChannels,
                      email: {
                        ...formData.notificationChannels.email,
                        emailAddress: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* SMS Channel */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={formData.notificationChannels.sms.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationChannels: {
                      ...formData.notificationChannels,
                      sms: {
                        ...formData.notificationChannels.sms,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 font-medium">SMS Notifications</span>
            </label>
            {formData.notificationChannels.sms.enabled && (
              <input
                type="tel"
                value={formData.notificationChannels.sms.phoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationChannels: {
                      ...formData.notificationChannels,
                      sms: {
                        ...formData.notificationChannels.sms,
                        phoneNumber: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* WhatsApp Channel */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={formData.notificationChannels.whatsapp.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationChannels: {
                      ...formData.notificationChannels,
                      whatsapp: {
                        ...formData.notificationChannels.whatsapp,
                        enabled: e.target.checked,
                      },
                    },
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 font-medium">WhatsApp Notifications</span>
            </label>
            {formData.notificationChannels.whatsapp.enabled && (
              <input
                type="tel"
                value={formData.notificationChannels.whatsapp.phoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationChannels: {
                      ...formData.notificationChannels,
                      whatsapp: {
                        ...formData.notificationChannels.whatsapp,
                        phoneNumber: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Enter WhatsApp number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Notification Types
        </h3>

        {/* Email Notifications */}
        {formData.notificationChannels.email.enabled && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">
              Email Notifications
            </h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.newOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailNotifications: {
                        ...formData.emailNotifications,
                        newOrder: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">New order received</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.orderStatusChange}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailNotifications: {
                        ...formData.emailNotifications,
                        orderStatusChange: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Order status changes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.lowStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailNotifications: {
                        ...formData.emailNotifications,
                        lowStock: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Low stock alerts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.newCustomer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailNotifications: {
                        ...formData.emailNotifications,
                        newCustomer: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">New customer registration</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications.dailyReport}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emailNotifications: {
                        ...formData.emailNotifications,
                        dailyReport: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Daily sales report</span>
              </label>
            </div>
          </div>
        )}

        {/* Customer Notifications */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">
            Customer Notifications
          </h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.whatsappNotifications.orderConfirmation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappNotifications: {
                      ...formData.whatsappNotifications,
                      orderConfirmation: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Order confirmation to customers</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.whatsappNotifications.orderStatusUpdate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappNotifications: {
                      ...formData.whatsappNotifications,
                      orderStatusUpdate: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Order status updates to customers</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.whatsappNotifications.deliveryNotification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappNotifications: {
                      ...formData.whatsappNotifications,
                      deliveryNotification: e.target.checked,
                    },
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Delivery notifications to customers</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Notification Settings
        </LoadingButton>
      </div>
    </form>
  );
}
