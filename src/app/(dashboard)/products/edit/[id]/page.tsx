"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/ProductForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        toast.error("Product not found");
        router.push("/products");
      }
    } catch (error) {
      toast.error("Error loading product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (productData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Product updated successfully");
        router.push("/products");
      } else {
        toast.error(data.message || "Failed to update product");
      }
    } catch (error) {
      toast.error("Error updating product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/products"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}
