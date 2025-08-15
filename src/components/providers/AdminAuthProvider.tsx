"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { loadAdminUser } from "@/store/slices/adminAuthSlice";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAppSelector(
    (state) => state.adminAuth
  );

  useEffect(() => {
    // Try to load admin user from server (using cookie)
    dispatch(loadAdminUser());
  }, [dispatch]);
  
  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading spinner while checking authentication
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

  // Show login page if not authenticated
  if (!isAuthenticated && pathname !== "/login") {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}
