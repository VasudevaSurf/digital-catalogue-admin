"use client";

import { LoadingSpinner } from "./LoadingSpinner";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading = false,
  loadingText = "Loading...",
  children,
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center ${className} ${
        isLoading || disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="small" color="white" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
