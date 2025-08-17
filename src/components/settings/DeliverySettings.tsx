"use client";

import { useState, useEffect } from "react";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Plus, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";

interface DeliveryZone {
  id: string;
  pincode: string;
  radiusKm: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  isActive: boolean;
  estimatedDeliveryDays: number;
}

export function DeliverySettings() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<DeliveryZone>>({
    pincode: "",
    radiusKm: 5,
    deliveryFee: 50,
    freeDeliveryThreshold: 500,
    isActive: true,
    estimatedDeliveryDays: 2,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/delivery");
      const data = await response.json();
      if (data.success && data.data) {
        setZones(data.data);
      }
    } catch (error) {
      toast.error("Failed to load delivery settings");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedZones = editingZone
        ? zones.map((zone) =>
            zone.id === editingZone.id ? { ...zone, ...formData } : zone
          )
        : [...zones, { ...formData, id: Date.now().toString() }];

      const response = await fetch("/api/admin/settings/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedZones),
      });

      if (response.ok) {
        toast.success("Delivery settings updated successfully");
        setZones(updatedZones as DeliveryZone[]);
        resetForm();
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      toast.error("Error updating settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData(zone);
    setShowAddForm(true);
  };

  const handleDelete = (zoneId: string) => {
    if (confirm("Are you sure you want to delete this delivery zone?")) {
      const updatedZones = zones.filter((zone) => zone.id !== zoneId);
      setZones(updatedZones);
      saveZones(updatedZones);
    }
  };

  const saveZones = async (updatedZones: DeliveryZone[]) => {
    try {
      const response = await fetch("/api/admin/settings/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedZones),
      });

      if (response.ok) {
        toast.success("Delivery settings updated");
      }
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const resetForm = () => {
    setFormData({
      pincode: "",
      radiusKm: 5,
      deliveryFee: 50,
      freeDeliveryThreshold: 500,
      isActive: true,
      estimatedDeliveryDays: 2,
    });
    setEditingZone(null);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Delivery Zones</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Zone
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-4 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius (km)
              </label>
              <input
                type="number"
                value={formData.radiusKm}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    radiusKm: parseInt(e.target.value),
                  })
                }
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Fee (₹)
              </label>
              <input
                type="number"
                value={formData.deliveryFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    deliveryFee: parseInt(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                value={formData.freeDeliveryThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    freeDeliveryThreshold: parseInt(e.target.value),
                  })
                }
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery (days)
              </label>
              <input
                type="number"
                value={formData.estimatedDeliveryDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedDeliveryDays: parseInt(e.target.value),
                  })
                }
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingZone ? "Update" : "Add"} Zone
            </LoadingButton>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pincode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Radius
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Delivery Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Free Above
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Est. Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {zones.map((zone) => (
              <tr key={zone.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {zone.pincode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {zone.radiusKm} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{zone.deliveryFee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₹{zone.freeDeliveryThreshold}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {zone.estimatedDeliveryDays} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      zone.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {zone.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
