import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminAnalyticsState,
  DashboardStats,
  SalesData,
  ProductAnalytics,
  CustomerAnalytics,
} from "@/types/admin";
import { api } from "@/lib/api";

const initialState: AdminAnalyticsState = {
  dashboardStats: null,
  salesData: [],
  productAnalytics: [],
  customerAnalytics: [],
  isLoading: false,
  error: null,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
    end: new Date().toISOString(),
  },
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  "adminAnalytics/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<DashboardStats>(
        "/api/admin/analytics/dashboard"
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard stats"
      );
    }
  }
);

export const fetchSalesData = createAsyncThunk(
  "adminAnalytics/fetchSalesData",
  async (
    { start, end }: { start: string; end: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get<SalesData[]>(
        `/api/admin/analytics/sales?start=${start}&end=${end}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sales data"
      );
    }
  }
);

export const fetchProductAnalytics = createAsyncThunk(
  "adminAnalytics/fetchProductAnalytics",
  async (params: { limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get<ProductAnalytics[]>(
        `/api/admin/analytics/products?limit=${params.limit || 10}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product analytics"
      );
    }
  }
);

export const fetchCustomerAnalytics = createAsyncThunk(
  "adminAnalytics/fetchCustomerAnalytics",
  async (params: { limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get<CustomerAnalytics[]>(
        `/api/admin/analytics/customers?limit=${params.limit || 10}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customer analytics"
      );
    }
  }
);

const adminAnalyticsSlice = createSlice({
  name: "adminAnalytics",
  initialState,
  reducers: {
    setDateRange: (
      state,
      action: PayloadAction<{ start: string; end: string }>
    ) => {
      state.dateRange = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Sales Data
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.salesData = action.payload;
      })

      // Product Analytics
      .addCase(fetchProductAnalytics.fulfilled, (state, action) => {
        state.productAnalytics = action.payload;
      })

      // Customer Analytics
      .addCase(fetchCustomerAnalytics.fulfilled, (state, action) => {
        state.customerAnalytics = action.payload;
      });
  },
});

export const { setDateRange, clearError } = adminAnalyticsSlice.actions;
export default adminAnalyticsSlice.reducer;
