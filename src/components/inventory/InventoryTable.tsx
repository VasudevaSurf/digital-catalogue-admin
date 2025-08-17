"use client";

import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Edit2 } from "lucide-react";

interface InventoryTableProps {
  inventory: any[];
  onAdjustStock: (product: any) => void;
}

export function InventoryTable({
  inventory,
  onAdjustStock,
}: InventoryTableProps) {
  if (!inventory.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No inventory items found</p>
      </div>
    );
  }

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stock <= threshold)
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inventory.map((item) => {
            const status = getStockStatus(item.stock, item.lowStockThreshold);
            const stockValue = item.stock * (item.costPrice || item.price);

            return (
              <tr key={item._id || item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">₹{item.price}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {item.stock}
                    </span>
                    {item.stock <= item.lowStockThreshold && item.stock > 0 && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500 ml-2" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Threshold: {item.lowStockThreshold}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(stockValue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onAdjustStock(item)}
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Adjust
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
