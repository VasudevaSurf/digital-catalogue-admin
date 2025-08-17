"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { ArrowLeft, Printer, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
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

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}/invoice`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order?.invoiceNumber}.pdf`;
      a.click();
    } catch (error) {
      toast.error("Failed to download invoice");
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
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrintInvoice}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </button>
        </div>
      </div>

      {/* Order Details */}
      <OrderDetails order={order} onUpdate={fetchOrder} />
    </div>
  );
}
