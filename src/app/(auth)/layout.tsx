"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { NotificationContainer } from "@/components/ui/NotificationContainer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      {children}
      <NotificationContainer />
    </Provider>
  );
}
