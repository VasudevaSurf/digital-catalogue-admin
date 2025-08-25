"use client";

import { useState, useEffect } from "react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ProductFormProps {
  product?: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ProductForm({
  product,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    weight: "",
    category: "",
    stock: "",
    sku: "",
    costPrice: "",
    lowStockThreshold: "10",
    isEligibleForFreeDelivery: true,
    isActive: true,
    images: [] as string[],
  });

  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        weight: product.weight?.toString() || "",
        category: product.category || "",
        stock: product.stock?.toString() || "",
        sku: product.sku || "",
        costPrice: product.costPrice?.toString() || "",
        lowStockThreshold: product.lowStockThreshold?.toString() || "10",
        isEligibleForFreeDelivery: product.isEligibleForFreeDelivery ?? true,
        isActive: product.isActive ?? true,
        images: product.images || [],
      });
    }
    fetchCategories();
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...imageFiles].slice(0, 5));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = async (index: number) => {
    const imageUrl = formData.images[index];

    try {
      // Delete from Vercel Blob
      const response = await fetch(
        `/api/upload?url=${encodeURIComponent(imageUrl)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        // Remove from state only after successful deletion
        setFormData((prev) => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
        }));
      } else {
        console.error("Failed to delete image:", result.message);
        // Still remove from UI even if deletion failed (maybe image was already deleted)
        setFormData((prev) => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== index),
        }));
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      // Still remove from UI in case of network error
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedUrls.push(data.url);

        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 100,
        }));
      }

      setSelectedFiles([]);
      setUploadProgress({});
      return uploadedUrls;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let allImages = [...formData.images];

      if (selectedFiles.length > 0) {
        const newUrls = await uploadImages();
        allImages = [...allImages, ...newUrls];
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        weight: parseFloat(formData.weight),
        stock: parseInt(formData.stock),
        costPrice: parseFloat(formData.costPrice),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        images: allImages,
      };

      await onSubmit(productData);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Failed to upload images. Please try again.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SKU
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Auto-generated if empty"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (₹) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cost Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cost Price (₹)
          </label>
          <input
            type="number"
            name="costPrice"
            value={formData.costPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight (kg) *
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            required
            min="0"
            step="0.001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Low Stock Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Low Stock Alert Threshold
          </label>
          <input
            type="number"
            name="lowStockThreshold"
            value={formData.lowStockThreshold}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Images Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images (Max 5)
        </label>

        {/* Existing Images */}
        {formData.images.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Current Images:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div
                  key={`existing-${index}-${url}`}
                  className="relative group"
                >
                  <Image
                    src={url}
                    alt={`Product image ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images to Upload */}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              New Images to Upload:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <div
                  key={`new-${index}-${file.name}-${file.size}`}
                  className="relative group"
                >
                  <div className="w-full h-24 bg-gray-100 rounded-lg border flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p
                    className="text-xs text-gray-600 mt-1 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {uploadProgress[file.name] && (
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-blue-500 h-1 rounded-b-lg transition-all duration-300"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Upload Input */}
        {formData.images.length + selectedFiles.length < 5 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
              disabled={uploadingImages}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload images or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB each
              </p>
            </label>
          </div>
        )}
      </div>

      {/* Checkboxes */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isEligibleForFreeDelivery"
            checked={formData.isEligibleForFreeDelivery}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            Eligible for Free Delivery
          </span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Active</span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <LoadingButton
          type="submit"
          isLoading={isLoading || uploadingImages}
          loadingText={
            uploadingImages
              ? "Uploading images..."
              : product
              ? "Updating..."
              : "Creating..."
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {product ? "Update Product" : "Create Product"}
        </LoadingButton>
      </div>
    </form>
  );
}
