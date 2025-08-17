// src/types/admin.ts
import {
  Product,
  Order,
  WhatsAppMessage,
  SMSMessage,
  StockAlert,
} from "./index";

// Re-export common types
export * from "./index";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "manager" | "staff";
  permissions: AdminPermission[];
  lastLogin: string;
  createdAt: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  resource: "products" | "orders" | "inventory" | "analytics";
  actions: ("create" | "read" | "update" | "delete")[];
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  monthlyOrders: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
  averageRating: number;
  viewCount: number;
}

export interface InventoryItem extends Product {
  lowStockThreshold: number;
  lastRestocked: string;
  supplier: string;
  costPrice: number;
  margin: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: Product;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  reference: string;
  createdBy: string;
  createdAt: string;
}

export interface OrderFilter {
  status?: Order["orderStatus"][];
  paymentStatus?: Order["paymentStatus"][];
  deliveryType?: Order["deliveryType"][];
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface ProductFilter {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  stockRange?: {
    min: number;
    max: number;
  };
  isActive?: boolean;
  lowStock?: boolean;
}

export interface ExportOptions {
  type: "orders" | "products" | "inventory";
  format: "csv" | "excel" | "pdf";
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: any;
  columns?: string[];
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: {
    row: number;
    field: string;
    message: string;
  }[];
}

// Redux State Interfaces
export interface AdminProductState {
  products: InventoryItem[];
  categories: string[];
  selectedProduct: InventoryItem | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilter;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AdminOrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  filters: OrderFilter;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AdminInventoryState {
  stockMovements: StockMovement[];
  stockAlerts: StockAlert[];
  isLoading: boolean;
  error: string | null;
}

export interface AdminAnalyticsState {
  dashboardStats: DashboardStats | null;
  salesData: SalesData[];
  productAnalytics: ProductAnalytics[];
  isLoading: boolean;
  error: string | null;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
