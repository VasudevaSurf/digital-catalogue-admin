// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import adminAuthSlice from "./slices/adminAuthSlice";
import adminProductSlice from "./slices/adminProductSlice";
import adminOrderSlice from "./slices/adminOrderSlice";
import adminCustomerSlice from "./slices/adminCustomerSlice";
import adminInventorySlice from "./slices/adminInventorySlice";
import adminMessageSlice from "./slices/adminMessageSlice";
import adminAnalyticsSlice from "./slices/adminAnalyticsSlice";
import adminSettingsSlice from "./slices/adminSettingsSlice";
import uiSlice from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthSlice,
    adminProducts: adminProductSlice,
    adminOrders: adminOrderSlice,
    adminCustomers: adminCustomerSlice,
    adminInventory: adminInventorySlice,
    adminMessages: adminMessageSlice,
    adminAnalytics: adminAnalyticsSlice,
    adminSettings: adminSettingsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
