"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Edit,
  Trash2,
  Save,
  Plus,
  Image as ImageIcon,
  Move,
  Eye,
  EyeOff,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface CarouselImage {
  id: string;
  url: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function CarouselManagement() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [draggedImage, setDraggedImage] = useState<CarouselImage | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [uploadForm, setUploadForm] = useState({
    files: [] as File[],
    title: "",
    description: "",
    order: 1,
    isActive: true,
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    order: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/carousel");
      const data = await response.json();
      if (Array.isArray(data)) {
        setImages(
          data.sort((a: CarouselImage, b: CarouselImage) => a.order - b.order)
        );
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching carousel images:", error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (imageId: string) => {
    setImageErrors((prev) => new Set([...prev, imageId]));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate files
    const validFiles = selectedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }

      return true;
    });

    setUploadForm((prev) => ({ ...prev, files: validFiles }));
  };

  const handleUpload = async () => {
    if (!uploadForm.files || uploadForm.files.length === 0) {
      alert("Please select at least one file");
      return;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();

      // Append all files
      uploadForm.files.forEach((file) => {
        formData.append("files", file);
      });

      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);
      formData.append("order", uploadForm.order.toString());
      formData.append("isActive", uploadForm.isActive.toString());

      const response = await fetch("/api/admin/carousel", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Add all uploaded images to the state
        setImages((prev) => {
          const newImages = [...prev, ...result.data];
          return newImages.sort((a, b) => a.order - b.order);
        });

        setUploadForm({
          files: [],
          title: "",
          description: "",
          order: Math.max(...images.map((img) => img.order), 0) + 1,
          isActive: true,
        });
        setShowUploadForm(false);
        alert(result.message || "Images uploaded successfully!");

        // Refresh the images list to get latest from blob
        fetchImages();
      } else {
        alert(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEdit = (image: CarouselImage) => {
    setEditingImage(image.id);
    setEditForm({
      title: image.title,
      description: image.description,
      order: image.order,
      isActive: image.isActive,
    });
  };

  const handleSaveEdit = async (imageId: string) => {
    try {
      const response = await fetch("/api/admin/carousel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: imageId,
          ...editForm,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setImages((prev) =>
          prev
            .map((img) =>
              img.id === imageId
                ? { ...img, ...editForm, updatedAt: result.data.updatedAt }
                : img
            )
            .sort((a, b) => a.order - b.order)
        );
        setEditingImage(null);
        alert("Image updated successfully!");
      } else {
        alert(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed");
    }
  };

  const handleDelete = async (image: CarouselImage) => {
    if (
      !confirm(
        `Are you sure you want to delete "${image.title || "this image"}"?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/carousel?id=${image.id}&url=${encodeURIComponent(
          image.url
        )}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        setImages((prev) => prev.filter((img) => img.id !== image.id));
        alert("Image deleted successfully!");
      } else {
        alert(result.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed");
    }
  };

  const handleDragStart = (e: React.DragEvent, image: CarouselImage) => {
    setDraggedImage(image);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetImage: CarouselImage) => {
    e.preventDefault();

    if (!draggedImage || draggedImage.id === targetImage.id) {
      setDraggedImage(null);
      return;
    }

    const newImages = [...images];
    const draggedIndex = newImages.findIndex(
      (img) => img.id === draggedImage.id
    );
    const targetIndex = newImages.findIndex((img) => img.id === targetImage.id);

    // Remove dragged item and insert at new position
    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, removed);

    // Update order values
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      order: index + 1,
    }));

    setImages(updatedImages);
    setDraggedImage(null);

    // Update order in backend (you can batch this)
    try {
      await Promise.all(
        updatedImages.map((img) =>
          fetch("/api/admin/carousel", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: img.id,
              title: img.title,
              description: img.description,
              order: img.order,
              isActive: img.isActive,
            }),
          })
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const toggleImageStatus = async (image: CarouselImage) => {
    try {
      const response = await fetch("/api/admin/carousel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: image.id,
          title: image.title,
          description: image.description,
          order: image.order,
          isActive: !image.isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, isActive: !img.isActive } : img
          )
        );
      } else {
        alert(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      alert("Update failed");
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Carousel Management
          </h2>
          <p className="text-gray-600">Manage homepage carousel images</p>
        </div>
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Image</span>
        </button>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload New Image</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Files * (Multiple files supported)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="carousel-file-input"
                  />
                  <label
                    htmlFor="carousel-file-input"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploadForm.files.length > 0
                        ? `${uploadForm.files.length} file(s) selected`
                        : "Click to upload images"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Max 5MB per file
                    </span>
                  </label>

                  {/* Show selected files */}
                  {uploadForm.files.length > 0 && (
                    <div className="mt-3 text-left">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Selected files:
                      </p>
                      <div className="space-y-1">
                        {uploadForm.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                          >
                            <span className="text-sm text-gray-600 truncate">
                              {file.name}
                            </span>
                            <button
                              onClick={() => {
                                const newFiles = uploadForm.files.filter(
                                  (_, i) => i !== index
                                );
                                setUploadForm((prev) => ({
                                  ...prev,
                                  files: newFiles,
                                }));
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter image title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Enter image description"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={uploadForm.order}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="1"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="upload-active"
                  checked={uploadForm.isActive}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label
                  htmlFor="upload-active"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active (show on website)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadForm.files.length === 0 || uploadLoading}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {uploadLoading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  `Upload ${uploadForm.files.length} Image(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Images Grid */}
      <div className="bg-white rounded-lg shadow-sm">
        {images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No carousel images
            </h3>
            <p className="text-gray-600">
              Get started by uploading your first carousel image.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {images.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, image)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, image)}
                className={`bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-move ${
                  draggedImage?.id === image.id ? "opacity-50" : ""
                }`}
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {imageErrors.has(image.id) ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="text-sm text-gray-500 ml-2">
                        Failed to load image
                      </span>
                    </div>
                  ) : (
                    <Image
                      src={image.url}
                      alt={image.title || "Carousel image"}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(image.id)}
                    />
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => toggleImageStatus(image)}
                      className={`p-1 rounded-full ${
                        image.isActive
                          ? "bg-green-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                      title={
                        image.isActive ? "Hide from website" : "Show on website"
                      }
                    >
                      {image.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      #{image.order}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {editingImage === image.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Title"
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                        rows={2}
                        placeholder="Description"
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editForm.order}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              order: parseInt(e.target.value) || 1,
                            }))
                          }
                          className="w-20 px-2 py-1 border rounded text-sm"
                          min="1"
                        />
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                isActive: e.target.checked,
                              }))
                            }
                            className="mr-1"
                          />
                          Active
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(image.id)}
                          className="flex-1 bg-primary-600 text-white py-1 px-2 rounded text-sm hover:bg-primary-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingImage(null)}
                          className="flex-1 bg-gray-300 text-gray-700 py-1 px-2 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {image.title || "Untitled"}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {image.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              image.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {image.isActive ? "Active" : "Inactive"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Order: {image.order}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit(image)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(image)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Drag and drop images to reorder them</li>
          <li>• Use the eye icon to toggle visibility on the website</li>
          <li>• Recommended image size: 1920x600 pixels</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
          <li>• Maximum file size: 5MB</li>
        </ul>
      </div>
    </div>
  );
}
