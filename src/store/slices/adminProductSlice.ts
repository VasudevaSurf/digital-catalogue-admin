// src/store/slices/adminProductSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminProductState,
  InventoryItem,
  ProductFilter,
  PaginatedResponse,
} from "@/types/admin";
import { api } from "@/lib/api";

const initialState: AdminProductState = {
  products: [],
  categories: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  filters: {
    categories: [],
    priceRange: { min: 0, max: 10000 },
    stockRange: { min: 0, max: 1000 },
    isActive: undefined,
    lowStock: false,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  "adminProducts/fetchProducts",
  async (
    params: { page?: number; limit?: number; filters?: Partial<ProductFilter> },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.filters?.categories?.length) {
        params.filters.categories.forEach((cat) =>
          queryParams.append("categories", cat)
        );
      }
      if (params.filters?.priceRange) {
        queryParams.append(
          "minPrice",
          params.filters.priceRange.min.toString()
        );
        queryParams.append(
          "maxPrice",
          params.filters.priceRange.max.toString()
        );
      }
      if (params.filters?.stockRange) {
        queryParams.append(
          "minStock",
          params.filters.stockRange.min.toString()
        );
        queryParams.append(
          "maxStock",
          params.filters.stockRange.max.toString()
        );
      }
      if (params.filters?.isActive !== undefined) {
        queryParams.append("isActive", params.filters.isActive.toString());
      }
      if (params.filters?.lowStock) {
        queryParams.append("lowStock", "true");
      }

      const response = await api.get<PaginatedResponse<InventoryItem>>(
        `/api/admin/products?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "adminProducts/fetchProductById",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<InventoryItem>(
        `/api/admin/products/${productId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "adminProducts/createProduct",
  async (productData: Partial<InventoryItem>, { rejectWithValue }) => {
    try {
      const response = await api.post<InventoryItem>(
        "/api/admin/products",
        productData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "adminProducts/updateProduct",
  async (
    {
      productId,
      productData,
    }: { productId: string; productData: Partial<InventoryItem> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put<InventoryItem>(
        `/api/admin/products/${productId}`,
        productData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "adminProducts/deleteProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/products/${productId}`);
      return productId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

export const updateProductStatus = createAsyncThunk(
  "adminProducts/updateProductStatus",
  async (
    { productId, isActive }: { productId: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<InventoryItem>(
        `/api/admin/products/${productId}/status`,
        { isActive }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product status"
      );
    }
  }
);

export const updateProductStock = createAsyncThunk(
  "adminProducts/updateProductStock",
  async (
    {
      productId,
      stock,
      reason,
    }: { productId: string; stock: number; reason: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<InventoryItem>(
        `/api/admin/products/${productId}/stock`,
        { stock, reason }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update stock"
      );
    }
  }
);

export const bulkUpdateProducts = createAsyncThunk(
  "adminProducts/bulkUpdateProducts",
  async (
    {
      productIds,
      updates,
    }: { productIds: string[]; updates: Partial<InventoryItem> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch<InventoryItem[]>(
        "/api/admin/products/bulk",
        { productIds, updates }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to bulk update products"
      );
    }
  }
);

export const importProducts = createAsyncThunk(
  "adminProducts/importProducts",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/admin/products/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to import products"
      );
    }
  }
);

const adminProductSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    setSelectedProduct: (
      state,
      action: PayloadAction<InventoryItem | null>
    ) => {
      state.selectedProduct = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (
      state,
      action: PayloadAction<{ page?: number; limit?: number }>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProductInList: (state, action: PayloadAction<InventoryItem>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.pagination = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })

      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
        state.pagination.total -= 1;
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
      })

      // Update Product Status
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })

      // Update Product Stock
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })

      // Bulk Update Products
      .addCase(bulkUpdateProducts.fulfilled, (state, action) => {
        action.payload.forEach((updatedProduct) => {
          const index = state.products.findIndex(
            (p) => p.id === updatedProduct.id
          );
          if (index !== -1) {
            state.products[index] = updatedProduct;
          }
        });
      });
  },
});

export const {
  setSelectedProduct,
  setFilters,
  clearFilters,
  setPagination,
  clearError,
  updateProductInList,
} = adminProductSlice.actions;

export default adminProductSlice.reducer;
