"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { NotificationContainer } from "@/components/ui/NotificationContainer";
import { AdminAuthProvider } from "@/components/providers/AdminAuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AdminAuthProvider>
        {children}
        <NotificationContainer />
      </AdminAuthProvider>
    </Provider>
  );
}
