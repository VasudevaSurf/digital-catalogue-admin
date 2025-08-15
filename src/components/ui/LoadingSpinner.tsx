"use client";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "white" | "gray";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "medium",
  color = "primary",
  className = "",
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const colorClasses = {
    primary: "border-primary-500 border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-300 border-t-gray-600",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  if (text) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div
          className={`
            ${sizeClasses[size]} 
            border-2 rounded-full animate-spin 
            ${colorClasses[color]}
          `}
          role="status"
          aria-label="Loading"
        />
        <span
          className={`${textSizeClasses[size]} ${
            color === "white" ? "text-white" : "text-gray-700"
          }`}
        >
          {text}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        border-2 rounded-full animate-spin 
        ${colorClasses[color]} 
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full-screen loading overlay component
export function LoadingOverlay({
  isVisible,
  text = "Loading...",
  backdrop = true,
}: {
  isVisible: boolean;
  text?: string;
  backdrop?: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        backdrop ? "bg-black bg-opacity-50" : ""
      }`}
    >
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-lg">
        <LoadingSpinner size="medium" />
        <span className="text-gray-700 font-medium">{text}</span>
      </div>
    </div>
  );
}

// Button with loading state
export function LoadingButton({
  children,
  isLoading,
  disabled,
  onClick,
  className = "",
  loadingText = "Loading...",
  variant = "primary",
  size = "medium",
  ...props
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
  };

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const spinnerSizes = {
    small: "small" as const,
    medium: "small" as const,
    large: "medium" as const,
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner
            size={spinnerSizes[size]}
            color="white"
            className="mr-2"
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
