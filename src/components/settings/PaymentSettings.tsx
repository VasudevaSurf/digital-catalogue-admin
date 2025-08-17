"use client";

import { useState } from "react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import toast from "react-hot-toast";

export function PaymentSettings() {
  const [formData, setFormData] = useState({
    paymentMethods: {
      cashOnDelivery: true,
      onlinePayment: true,
      storePickup: true,
    },
    onlinePaymentGateway: {
      provider: "razorpay",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      isActive: false,
    },
    taxSettings: {
      gstNumber: "",
      taxRate: 18,
      includeTaxInPrice: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Save payment settings
      toast.success("Payment settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Payment Methods
        </h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.paymentMethods.cashOnDelivery}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    cashOnDelivery: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">Cash on Delivery</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.paymentMethods.onlinePayment}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    onlinePayment: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">Online Payment</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.paymentMethods.storePickup}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethods: {
                    ...formData.paymentMethods,
                    storePickup: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">Store Pickup</span>
          </label>
        </div>
      </div>

      {/* Online Payment Gateway */}
      {formData.paymentMethods.onlinePayment && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Online Payment Gateway
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Provider
              </label>
              <select
                value={formData.onlinePaymentGateway.provider}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    onlinePaymentGateway: {
                      ...formData.onlinePaymentGateway,
                      provider: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="razorpay">Razorpay</option>
                <option value="stripe">Stripe</option>
                <option value="paytm">Paytm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={formData.onlinePaymentGateway.apiKey}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    onlinePaymentGateway: {
                      ...formData.onlinePaymentGateway,
                      apiKey: e.target.value,
                    },
                  })
                }
                placeholder="Enter API key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret
              </label>
              <input
                type="password"
                value={formData.onlinePaymentGateway.apiSecret}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    onlinePaymentGateway: {
                      ...formData.onlinePaymentGateway,
                      apiSecret: e.target.value,
                    },
                  })
                }
                placeholder="Enter API secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret
              </label>
              <input
                type="password"
                value={formData.onlinePaymentGateway.webhookSecret}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    onlinePaymentGateway: {
                      ...formData.onlinePaymentGateway,
                      webhookSecret: e.target.value,
                    },
                  })
                }
                placeholder="Enter webhook secret"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={formData.onlinePaymentGateway.isActive}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  onlinePaymentGateway: {
                    ...formData.onlinePaymentGateway,
                    isActive: e.target.checked,
                  },
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2">Enable online payments</span>
          </label>
        </div>
      )}

      {/* Tax Settings */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Number (Optional)
            </label>
            <input
              type="text"
              value={formData.taxSettings.gstNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  taxSettings: {
                    ...formData.taxSettings,
                    gstNumber: e.target.value,
                  },
                })
              }
              placeholder="Enter GST number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={formData.taxSettings.taxRate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  taxSettings: {
                    ...formData.taxSettings,
                    taxRate: parseInt(e.target.value) || 0,
                  },
                })
              }
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <label className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={formData.taxSettings.includeTaxInPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                taxSettings: {
                  ...formData.taxSettings,
                  includeTaxInPrice: e.target.checked,
                },
              })
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2">Include tax in product prices</span>
        </label>
      </div>

      <div className="flex justify-end">
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Payment Settings
        </LoadingButton>
      </div>
    </form>
  );
}
