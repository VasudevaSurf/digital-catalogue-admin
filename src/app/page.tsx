"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      const data = await response.json();

      if (data.success && data.user) {
        // User is authenticated, redirect to dashboard
        router.replace("/dashboard");
      } else {
        // User is not authenticated, redirect to login
        router.replace("/login");
      }
    } catch (error) {
      // On error, redirect to login
      router.replace("/login");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
