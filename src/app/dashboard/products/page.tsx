// src/app/dashboard/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchProducts,
  deleteProduct,
  updateProductStatus,
} from "@/store/slices/adminProductSlice";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductFilters } from "@/components/products/ProductFilters";
import { SearchInput } from "@/components/ui/SearchInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Pagination } from "@/components/ui/Pagination";
import { Plus, Download, Upload, Filter } from "lucide-react";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, isLoading, pagination, filters } = useAppSelector(
    (state) => state.adminProducts
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: pagination.page,
        limit: pagination.limit,
        filters: { ...filters, searchQuery },
      })
    );
  }, [dispatch, pagination.page, pagination.limit, filters, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(productId));
    }
  };

  const handleStatusToggle = (productId: string, isActive: boolean) => {
    dispatch(updateProductStatus({ productId, isActive: !isActive }));
  };

  const handlePageChange = (page: number) => {
    dispatch(
      fetchProducts({
        page,
        limit: pagination.limit,
        filters: { ...filters, searchQuery },
      })
    );
  };

  const handleExportProducts = () => {
    // Implementation for exporting products
    console.log("Exporting products...");
  };

  const handleImportProducts = () => {
    // Implementation for importing products
    console.log("Importing products...");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleImportProducts}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={handleExportProducts}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <Link
            href="/dashboard/products/add"
            className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search products by name, category, or description..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? "bg-primary-50 border-primary-200 text-primary-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <ProductFilters />
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            <ProductTable
              products={products}
              onEdit={(product) =>
                (window.location.href = `/dashboard/products/${product.id}`)
              }
              onDelete={handleDeleteProduct}
              onStatusToggle={handleStatusToggle}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
