"use client";

import { useState } from "react";
import Image from "next/image";
import { InventoryItem } from "@/types/admin";
import { formatCurrency, formatWeight } from "@/lib/utils";
import {
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface ProductTableProps {
  products: InventoryItem[];
  onEdit: (product: InventoryItem) => void;
  onDelete: (productId: string) => void;
  onStatusToggle: (productId: string, isActive: boolean) => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onStatusToggle,
}: ProductTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedProducts(
      checked ? products.map((p) => p.id || p._id || "") : []
    );
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };

  const getStockStatus = (product: InventoryItem) => {
    if (product.stock === 0) {
      return { status: "out-of-stock", color: "text-red-600", bg: "bg-red-50" };
    } else if (product.stock <= product.lowStockThreshold) {
      return {
        status: "low-stock",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    } else {
      return { status: "in-stock", color: "text-green-600", bg: "bg-green-50" };
    }
  };

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600">
          Get started by adding your first product.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={
                  selectedProducts.length === products.length &&
                  products.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product, index) => {
            const productId = product.id || product._id || `product-${index}`;
            const stockStatus = getStockStatus(product);
            const isSelected = selectedProducts.includes(productId);

            return (
              <tr
                key={productId}
                className={`hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-primary-50" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      handleSelectProduct(productId, e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name || "Product image"}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatWeight(product.weight)}
                      </div>
                      {product.sku && (
                        <div className="text-xs text-gray-400">
                          SKU: {product.sku}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {product.category}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(product.price)}
                  </div>
                  {product.costPrice && (
                    <div className="text-xs text-gray-500">
                      Cost: {formatCurrency(product.costPrice)}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span
                      className={`text-sm font-medium ${stockStatus.color}`}
                    >
                      {product.stock}
                    </span>
                    {product.stock <= product.lowStockThreshold &&
                      product.stock > 0 && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 ml-1" />
                      )}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${stockStatus.bg} ${stockStatus.color}`}
                  >
                    {stockStatus.status.replace("-", " ")}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() =>
                      onStatusToggle(productId, product.isActive ?? true)
                    }
                    className="flex items-center"
                    title={
                      product.isActive
                        ? "Active - Click to deactivate"
                        : "Inactive - Click to activate"
                    }
                  >
                    {product.isActive ? (
                      <ToggleRight className="w-8 h-8 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400" />
                    )}
                  </button>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50 transition-colors"
                      title="Edit product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        window.open(`/products/${productId}`, "_blank")
                      }
                      className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50 transition-colors"
                      title="View product"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete "${product.name}"?`
                          )
                        ) {
                          onDelete(productId);
                        }
                      }}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border-t border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedProducts.length} product
              {selectedProducts.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  // Handle bulk status toggle
                  console.log("Bulk toggle status for:", selectedProducts);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Toggle Status
              </button>
              <button
                onClick={() => {
                  // Handle bulk delete
                  if (
                    window.confirm(
                      `Are you sure you want to delete ${selectedProducts.length} products?`
                    )
                  ) {
                    selectedProducts.forEach((productId) =>
                      onDelete(productId)
                    );
                    setSelectedProducts([]);
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
