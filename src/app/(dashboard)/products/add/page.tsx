"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/ProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (productData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Product created successfully");
        router.push("/products");
      } else {
        toast.error(data.message || "Failed to create product");
      }
    } catch (error) {
      toast.error("Error creating product");
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
            <p className="text-gray-600">Create a new product listing</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
