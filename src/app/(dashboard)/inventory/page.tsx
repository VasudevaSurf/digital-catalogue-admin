"use client";

import { useState, useEffect } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { StockAdjustmentForm } from "@/components/inventory/StockAdjustmentForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Package, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/inventory");
      const data = await response.json();

      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockAdjustment = async (adjustmentData: any) => {
    try {
      const response = await fetch("/api/admin/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adjustmentData),
      });

      if (response.ok) {
        toast.success("Stock adjusted successfully");
        setShowAdjustmentForm(false);
        setSelectedProduct(null);
        fetchInventory();
      }
    } catch (error) {
      toast.error("Failed to adjust stock");
    }
  };

  const lowStockCount = inventory.filter(
    (item: any) => item.stock <= item.lowStockThreshold
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage stock levels and movements</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventory.length}
              </p>
            </div>
            <Package className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">
                {lowStockCount}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {inventory.filter((item: any) => item.stock === 0).length}
              </p>
            </div>
            <Package className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Stock Adjustment Form */}
      {showAdjustmentForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Stock Adjustment</h2>
          <StockAdjustmentForm
            product={selectedProduct}
            onSubmit={handleStockAdjustment}
            onCancel={() => {
              setShowAdjustmentForm(false);
              setSelectedProduct(null);
            }}
          />
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <InventoryTable
            inventory={inventory}
            onAdjustStock={(product) => {
              setSelectedProduct(product);
              setShowAdjustmentForm(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
