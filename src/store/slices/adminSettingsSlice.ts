import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminSettingsState,
  ShopSettings,
  DeliverySettings,
} from "@/types/admin";
import { api } from "@/lib/api";

const initialState: AdminSettingsState = {
  shopSettings: null,
  deliverySettings: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchShopSettings = createAsyncThunk(
  "adminSettings/fetchShopSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ShopSettings>("/api/admin/settings/shop");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shop settings"
      );
    }
  }
);

export const updateShopSettings = createAsyncThunk(
  "adminSettings/updateShopSettings",
  async (settings: Partial<ShopSettings>, { rejectWithValue }) => {
    try {
      const response = await api.put<ShopSettings>(
        "/api/admin/settings/shop",
        settings
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update shop settings"
      );
    }
  }
);

export const fetchDeliverySettings = createAsyncThunk(
  "adminSettings/fetchDeliverySettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<DeliverySettings[]>(
        "/api/admin/settings/delivery"
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch delivery settings"
      );
    }
  }
);

export const updateDeliverySettings = createAsyncThunk(
  "adminSettings/updateDeliverySettings",
  async (settings: DeliverySettings[], { rejectWithValue }) => {
    try {
      const response = await api.put<DeliverySettings[]>(
        "/api/admin/settings/delivery",
        settings
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update delivery settings"
      );
    }
  }
);

const adminSettingsSlice = createSlice({
  name: "adminSettings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Shop Settings
      .addCase(fetchShopSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShopSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shopSettings = action.payload;
      })
      .addCase(fetchShopSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(updateShopSettings.fulfilled, (state, action) => {
        state.shopSettings = action.payload;
      })

      // Delivery Settings
      .addCase(fetchDeliverySettings.fulfilled, (state, action) => {
        state.deliverySettings = action.payload;
      })

      .addCase(updateDeliverySettings.fulfilled, (state, action) => {
        state.deliverySettings = action.payload;
      });
  },
});

export const { clearError } = adminSettingsSlice.actions;
export default adminSettingsSlice.reducer;
