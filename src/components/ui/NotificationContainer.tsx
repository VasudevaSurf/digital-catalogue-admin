"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { removeNotification } from "@/store/slices/uiSlice";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export function NotificationContainer() {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.ui);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.autoHide) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications
        .filter((notification) => notification.isVisible)
        .map((notification, index) => (
          <div
            key={notification.id}
            className={`
              w-full shadow-lg rounded-lg border p-4 transform transition-all duration-300 ease-in-out animate-slideInRight
              ${getNotificationStyles(notification.type)}
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>

              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => dispatch(removeNotification(notification.id))}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
