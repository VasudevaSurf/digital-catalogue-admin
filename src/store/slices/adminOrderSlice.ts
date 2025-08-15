import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminOrderState,
  Order,
  OrderFilter,
  PaginatedResponse,
} from "@/types/admin";
import { api } from "@/lib/api";

const initialState: AdminOrderState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  "adminOrders/fetchOrders",
  async (
    params: { page?: number; limit?: number; filters?: OrderFilter },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.filters?.status?.length) {
        params.filters.status.forEach((status) =>
          queryParams.append("status", status)
        );
      }
      if (params.filters?.paymentStatus?.length) {
        params.filters.paymentStatus.forEach((status) =>
          queryParams.append("paymentStatus", status)
        );
      }
      if (params.filters?.deliveryType?.length) {
        params.filters.deliveryType.forEach((type) =>
          queryParams.append("deliveryType", type)
        );
      }
      if (params.filters?.dateRange) {
        queryParams.append("startDate", params.filters.dateRange.start);
        queryParams.append("endDate", params.filters.dateRange.end);
      }

      const response = await api.get<PaginatedResponse<Order>>(
        `/api/admin/orders?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  "adminOrders/fetchRecentOrders",
  async (params: { limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get<Order[]>(
        `/api/admin/orders/recent?limit=${params.limit || 5}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recent orders"
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "adminOrders/fetchOrderById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Order>(`/api/admin/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async (
    { orderId, status }: { orderId: string; status: Order["orderStatus"] },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<Order>(
        `/api/admin/orders/${orderId}/status`,
        { status }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrders",
  initialState,
  reducers: {
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<OrderFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Recent Orders
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        // For dashboard - don't replace main orders list
        if (state.orders.length === 0) {
          state.orders = action.payload;
        }
      })

      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      });
  },
});

export const { setSelectedOrder, setFilters, clearFilters, clearError } =
  adminOrderSlice.actions;
export default adminOrderSlice.reducer;
