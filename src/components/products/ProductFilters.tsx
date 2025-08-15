"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setFilters, clearFilters } from "@/store/slices/adminProductSlice";
import { X, Filter } from "lucide-react";

export function ProductFilters() {
  const dispatch = useAppDispatch();
  const { filters, categories } = useAppSelector(
    (state) => state.adminProducts
  );
  const [tempFilters, setTempFilters] = useState(filters);

  const applyFilters = () => {
    dispatch(setFilters(tempFilters));
  };

  const resetFilters = () => {
    const emptyFilters = {
      categories: [],
      priceRange: { min: 0, max: 10000 },
      stockRange: { min: 0, max: 1000 },
      isActive: undefined,
      lowStock: false,
    };
    setTempFilters(emptyFilters);
    dispatch(clearFilters());
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...(tempFilters.categories || []), category]
      : (tempFilters.categories || []).filter((c) => c !== category);

    setTempFilters({ ...tempFilters, categories: updatedCategories });
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={(tempFilters.categories || []).includes(category)}
                onChange={(e) =>
                  handleCategoryChange(category, e.target.checked)
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Min Price
            </label>
            <input
              type="number"
              value={tempFilters.priceRange?.min || 0}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  priceRange: {
                    ...tempFilters.priceRange!,
                    min: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Max Price
            </label>
            <input
              type="number"
              value={tempFilters.priceRange?.max || 10000}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  priceRange: {
                    ...tempFilters.priceRange!,
                    max: parseInt(e.target.value) || 10000,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="10000"
            />
          </div>
        </div>
      </div>

      {/* Stock Range */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Stock Level</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Min Stock
            </label>
            <input
              type="number"
              value={tempFilters.stockRange?.min || 0}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  stockRange: {
                    ...tempFilters.stockRange!,
                    min: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Max Stock
            </label>
            <input
              type="number"
              value={tempFilters.stockRange?.max || 1000}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  stockRange: {
                    ...tempFilters.stockRange!,
                    max: parseInt(e.target.value) || 1000,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="1000"
            />
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Status</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              checked={tempFilters.isActive === undefined}
              onChange={() =>
                setTempFilters({ ...tempFilters, isActive: undefined })
              }
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">All Products</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              checked={tempFilters.isActive === true}
              onChange={() =>
                setTempFilters({ ...tempFilters, isActive: true })
              }
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active Only</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              checked={tempFilters.isActive === false}
              onChange={() =>
                setTempFilters({ ...tempFilters, isActive: false })
              }
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Inactive Only</span>
          </label>
        </div>
      </div>

      {/* Special Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Special Filters
        </h4>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={tempFilters.lowStock || false}
            onChange={(e) =>
              setTempFilters({ ...tempFilters, lowStock: e.target.checked })
            }
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Low Stock Only</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-4 border-t">
        <button
          onClick={applyFilters}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={resetFilters}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
