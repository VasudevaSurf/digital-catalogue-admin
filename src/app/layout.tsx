// src/app/layout.tsx
"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { Provider } from "react-redux";
import { store } from "@/store";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { NotificationContainer } from "@/components/ui/NotificationContainer";
import { AdminAuthProvider } from "@/components/providers/AdminAuthProvider";
import { useAppSelector } from "@/store";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.adminAuth);

  if (!isAuthenticated) {
    return children;
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider store={store}>
          <AdminAuthProvider>
            <LayoutContent>{children}</LayoutContent>
            <NotificationContainer />
          </AdminAuthProvider>
        </Provider>
      </body>
    </html>
  );
}
