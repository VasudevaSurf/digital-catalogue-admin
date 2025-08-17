"use client";

import { useState, useEffect } from "react";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Download, UserPlus } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchQuery,
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, searchQuery]);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/customers/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${new Date().toISOString()}.csv`;
      a.click();
    } catch (error) {
      toast.error("Failed to export customers");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <Link
            href="/customers/add"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search customers..."
          className="max-w-md"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            <CustomersTable customers={customers} />
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) =>
                    setPagination({ ...pagination, page })
                  }
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
