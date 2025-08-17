"use client";

import { useState } from "react";
import { LoadingButton } from "@/components/ui/LoadingButton";

interface StockAdjustmentFormProps {
  product: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function StockAdjustmentForm({
  product,
  onSubmit,
  onCancel,
}: StockAdjustmentFormProps) {
  const [formData, setFormData] = useState({
    productId: product?._id || product?.id,
    type: "adjustment",
    quantity: product?.stock || 0,
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setFormData({ ...formData, type });
    if (type === "adjustment") {
      setFormData({ ...formData, type, quantity: product?.stock || 0 });
    } else {
      setFormData({ ...formData, type, quantity: 0 });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product
        </label>
        <input
          type="text"
          value={product?.name || ""}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Stock
        </label>
        <input
          type="number"
          value={product?.stock || 0}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adjustment Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange("in")}
            className={`px-4 py-2 rounded-lg border ${
              formData.type === "in"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Stock In
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("out")}
            className={`px-4 py-2 rounded-lg border ${
              formData.type === "out"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Stock Out
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("adjustment")}
            className={`px-4 py-2 rounded-lg border ${
              formData.type === "adjustment"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Set Stock
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {formData.type === "adjustment" ? "New Stock Quantity" : "Quantity"}
        </label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({
              ...formData,
              quantity: parseInt(e.target.value) || 0,
            })
          }
          min="0"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {formData.type !== "adjustment" && (
          <p className="text-sm text-gray-500 mt-1">
            New stock will be:{" "}
            {product?.stock +
              (formData.type === "in" ? formData.quantity : -formData.quantity)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason *
        </label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          required
          rows={3}
          placeholder="Enter reason for stock adjustment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Adjust Stock
        </LoadingButton>
      </div>
    </form>
  );
}
