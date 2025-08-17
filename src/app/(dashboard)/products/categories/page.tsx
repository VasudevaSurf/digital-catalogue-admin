"use client";

import { useState, useEffect } from "react";
import { CategoriesTable } from "@/components/products/CategoriesTable";
import { CategoryForm } from "@/components/products/CategoryForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (categoryData: any) => {
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory._id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        toast.success(
          editingCategory
            ? "Category updated successfully"
            : "Category created successfully"
        );
        setShowAddForm(false);
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Category deleted successfully");
        fetchCategories();
      }
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingCategory(null);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingCategory) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h2>
          <CategoryForm
            category={editingCategory}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowAddForm(false);
              setEditingCategory(null);
            }}
          />
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <CategoriesTable
            categories={categories}
            onEdit={setEditingCategory}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
