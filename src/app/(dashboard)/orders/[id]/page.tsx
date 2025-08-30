"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error("Order not found");
        router.push("/orders");
      }
    } catch (error) {
      toast.error("Error loading order");
    } finally {
      setIsLoading(false);
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
            href="/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order?.invoiceNumber}
            </h1>
            <p className="text-gray-600">Order details and management</p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <OrderDetails order={order} onUpdate={fetchOrder} />
    </div>
  );
}
