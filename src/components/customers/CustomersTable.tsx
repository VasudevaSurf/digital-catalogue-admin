"use client";

import Link from "next/link";
import { Customer } from "@/types/admin";
import { formatPhoneNumber, formatDateTime, formatCurrency } from "@/lib/utils";
import { Eye, Edit, MessageSquare } from "lucide-react";

interface CustomersTableProps {
  customers: Customer[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  if (!customers.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No customers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Orders
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Spent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {customer.name || "Guest Customer"}
                  </div>
                  {customer.email && (
                    <div className="text-sm text-gray-500">
                      {customer.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatPhoneNumber(customer.phoneNumber)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {customer.totalOrders || 0}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatCurrency(customer.totalSpent || 0)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {customer.lastOrderDate
                    ? formatDateTime(customer.lastOrderDate)
                    : "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="text-blue-600 hover:text-blue-900"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/customers/edit/${customer.id}`}
                    className="text-gray-600 hover:text-gray-900"
                    title="Edit customer"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/messages/send?customerId=${customer.id}`}
                    className="text-green-600 hover:text-green-900"
                    title="Send message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
