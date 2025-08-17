"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { NotificationContainer } from "@/components/ui/NotificationContainer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check auth when route changes

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      const data = await response.json();

      if (data.success && data.user) {
        setIsAuthenticated(true);
        // Store user data in localStorage
        localStorage.setItem("adminUser", JSON.stringify(data.user));
      } else {
        // Not authenticated, redirect to login
        router.replace("/login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will handle redirect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <DashboardContent>{children}</DashboardContent>
      <NotificationContainer />
      <Toaster position="top-right" />
    </Provider>
  );
}
