// src/lib/api.ts
import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";

// Create axios instance - remove the base URL since we're using Next.js API routes
export const api = axios.create({
  // Remove baseURL to use relative paths for Next.js API routes
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // For admin panel, use adminToken; for main site, use authToken
    const isAdminRoute = config.url?.includes("/admin/");
    const tokenKey = isAdminRoute ? "adminToken" : "authToken";
    const token = localStorage.getItem(tokenKey);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time for debugging
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime();
      console.log(
        `API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${duration}ms`
      );
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - remove token and redirect to login
      const isAdminRoute = error.config?.url?.includes("/admin/");
      const tokenKey = isAdminRoute ? "adminToken" : "authToken";
      const loginPath = isAdminRoute ? "/login" : "/auth/login";

      localStorage.removeItem(tokenKey);

      // Only redirect if we're in the browser and not already on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = loginPath;
      }
    }

    if (error.response?.status === 403) {
      // Forbidden
      console.error("Access forbidden:", error.response.data);
    }

    if (error.response?.status === 404) {
      // Not found
      console.error("Resource not found:", error.config?.url);
    }

    if (error.response?.status >= 500) {
      // Server error
      console.error(
        "Server error:",
        error.response.status,
        error.response.data
      );
    }

    // Network error
    if (error.code === "NETWORK_ERROR" || !error.response) {
      console.error("Network error - please check your connection");
    }

    return Promise.reject(error);
  }
);

// Enhanced API utility functions
export const apiUtils = {
  // Generic GET request
  get: async <T>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.get<T>(url, { params, ...config });
    return response.data;
  },

  // Generic POST request
  post: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.post<T>(url, data, config);
    return response.data;
  },

  // Generic PUT request
  put: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.put<T>(url, data, config);
    return response.data;
  },

  // Generic PATCH request
  patch: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  },

  // Generic DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<T>(url, config);
    return response.data;
  },

  // Upload file with progress
  uploadFile: async (
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    // Add additional form data if provided
    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Upload multiple files
  uploadMultipleFiles: async (
    url: string,
    files: File[],
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<any> => {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Download file
  downloadFile: async (url: string, filename: string): Promise<void> => {
    const response = await api.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Export data as CSV
  exportCSV: async (
    url: string,
    filename: string,
    params?: any
  ): Promise<void> => {
    const response = await api.get(url, {
      params,
      responseType: "blob",
      headers: {
        Accept: "text/csv",
      },
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Export data as Excel
  exportExcel: async (
    url: string,
    filename: string,
    params?: any
  ): Promise<void> => {
    const response = await api.get(url, {
      params,
      responseType: "blob",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Retry failed requests
  retryRequest: async <T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw new Error("Max retries exceeded");
  },

  // Batch requests
  batchRequests: async <T>(
    requests: (() => Promise<T>)[],
    concurrent: number = 5
  ): Promise<T[]> => {
    const results: T[] = [];

    for (let i = 0; i < requests.length; i += concurrent) {
      const batch = requests.slice(i, i + concurrent);
      const batchResults = await Promise.all(batch.map((request) => request()));
      results.push(...batchResults);
    }

    return results;
  },

  // Health check
  healthCheck: async (): Promise<boolean> => {
    try {
      await api.get("/api/health");
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Specialized API functions for common operations
export const authAPI = {
  login: (credentials: {
    username?: string;
    phoneNumber?: string;
    password?: string;
    otp?: string;
  }) => apiUtils.post("/api/auth/login", credentials),

  adminLogin: (credentials: { username: string; password: string }) =>
    apiUtils.post("/api/auth/login", credentials),

  logout: () => apiUtils.post("/api/auth/logout"),

  refreshToken: () => apiUtils.post("/api/auth/refresh"),

  sendOTP: (phoneNumber: string) =>
    apiUtils.post("/api/auth/send-otp", { phoneNumber }),

  verifyOTP: (phoneNumber: string, otp: string) =>
    apiUtils.post("/api/auth/verify-otp", { phoneNumber, otp }),

  verify: () => apiUtils.get("/api/auth/verify"),
};

export const productAPI = {
  getAll: (params?: any) => apiUtils.get("/api/products", params),

  getById: (id: string) => apiUtils.get(`/api/products/${id}`),

  create: (product: any) => apiUtils.post("/api/products", product),

  update: (id: string, product: any) =>
    apiUtils.put(`/api/products/${id}`, product),

  delete: (id: string) => apiUtils.delete(`/api/products/${id}`),

  search: (query: string) => apiUtils.get("/api/products/search", { q: query }),

  getCategories: () => apiUtils.get("/api/products/categories"),
};

export const orderAPI = {
  getAll: (params?: any) => apiUtils.get("/api/orders", params),

  getById: (id: string) => apiUtils.get(`/api/orders/${id}`),

  create: (order: any) => apiUtils.post("/api/orders", order),

  updateStatus: (id: string, status: string) =>
    apiUtils.patch(`/api/orders/${id}/status`, { status }),

  cancel: (id: string, reason?: string) =>
    apiUtils.patch(`/api/orders/${id}/cancel`, { reason }),
};

export const adminAPI = {
  // Dashboard
  getDashboardStats: () => apiUtils.get("/api/admin/analytics/dashboard"),

  getSalesData: (params: { start: string; end: string }) =>
    apiUtils.get("/api/admin/analytics/sales", params),

  // Products
  getProducts: (params?: any) => apiUtils.get("/api/admin/products", params),

  createProduct: (product: any) =>
    apiUtils.post("/api/admin/products", product),

  updateProduct: (id: string, product: any) =>
    apiUtils.put(`/api/admin/products/${id}`, product),

  deleteProduct: (id: string) => apiUtils.delete(`/api/admin/products/${id}`),

  // Categories
  getCategories: () => apiUtils.get("/api/admin/categories"),

  createCategory: (category: any) =>
    apiUtils.post("/api/admin/categories", category),

  updateCategory: (id: string, category: any) =>
    apiUtils.put(`/api/admin/categories/${id}`, category),

  deleteCategory: (id: string) =>
    apiUtils.delete(`/api/admin/categories/${id}`),

  // Orders
  getOrders: (params?: any) => apiUtils.get("/api/admin/orders", params),

  getOrderById: (id: string) => apiUtils.get(`/api/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: string) =>
    apiUtils.patch(`/api/admin/orders/${id}/status`, { status }),

  getRecentOrders: (params?: any) =>
    apiUtils.get("/api/admin/orders/recent", params),

  exportOrders: (params?: any) =>
    apiUtils.exportCSV("/api/admin/orders/export", "orders", params),

  // Inventory
  getInventory: () => apiUtils.get("/api/admin/inventory"),

  getStockAlerts: () => apiUtils.get("/api/admin/inventory/alerts"),

  getStockMovements: (params?: any) =>
    apiUtils.get("/api/admin/inventory/movements", params),

  createStockMovement: (movement: any) =>
    apiUtils.post("/api/admin/inventory/movements", movement),

  adjustStock: (productId: string, adjustment: any) =>
    apiUtils.post(`/api/admin/inventory/adjust`, {
      productId,
      ...adjustment,
    }),

  // Analytics
  getProductAnalytics: (params?: any) =>
    apiUtils.get("/api/admin/analytics/products", params),

  getRevenueAnalytics: (params?: any) =>
    apiUtils.get("/api/admin/analytics/revenue", params),

  getOrderAnalytics: (params?: any) =>
    apiUtils.get("/api/admin/analytics/orders", params),

  // Import/Export
  importProducts: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUtils.post("/api/admin/products/import", formData);
  },

  exportProducts: (params?: any) =>
    apiUtils.exportCSV("/api/admin/products/export", "products", params),

  exportInventory: (params?: any) =>
    apiUtils.exportExcel("/api/admin/inventory/export", "inventory", params),
};

// Error handling utilities
export const handleAPIError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || "An error occurred",
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      message: "Network error - please check your connection",
      status: 0,
      data: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || "An unexpected error occurred",
      status: -1,
      data: null,
    };
  }
};

// Request cancellation
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// Default export
export default api;
