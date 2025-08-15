import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AdminInventoryState, StockMovement, StockAlert } from "@/types/admin";
import { api } from "@/lib/api";

const initialState: AdminInventoryState = {
  stockMovements: [],
  stockAlerts: [],
  isLoading: false,
  error: null,
};

export const fetchStockMovements = createAsyncThunk(
  "adminInventory/fetchStockMovements",
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get<StockMovement[]>(
        `/api/admin/inventory/movements?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stock movements"
      );
    }
  }
);

export const fetchLowStockAlerts = createAsyncThunk(
  "adminInventory/fetchLowStockAlerts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<StockAlert[]>(
        "/api/admin/inventory/alerts"
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stock alerts"
      );
    }
  }
);

const adminInventorySlice = createSlice({
  name: "adminInventory",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockMovements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stockMovements = action.payload;
      })
      .addCase(fetchStockMovements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchLowStockAlerts.fulfilled, (state, action) => {
        state.stockAlerts = action.payload;
      });
  },
});

export const { clearError } = adminInventorySlice.actions;
export default adminInventorySlice.reducer;
