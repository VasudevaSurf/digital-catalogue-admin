import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminCustomerState,
  Customer,
  CustomerFilter,
  PaginatedResponse,
} from "@/types/admin";
import { api } from "@/lib/api";

const initialState: AdminCustomerState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const fetchCustomers = createAsyncThunk(
  "adminCustomers/fetchCustomers",
  async (
    params: { page?: number; limit?: number; filters?: CustomerFilter },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const response = await api.get<PaginatedResponse<Customer>>(
        `/api/admin/customers?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch customers"
      );
    }
  }
);

const adminCustomerSlice = createSlice({
  name: "adminCustomers",
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<CustomerFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.data;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCustomer, setFilters, clearError } =
  adminCustomerSlice.actions;
export default adminCustomerSlice.reducer;
