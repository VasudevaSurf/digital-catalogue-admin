// src/types/admin.ts
import {
  Product,
  Order,
  Customer,
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
  resource:
    | "products"
    | "orders"
    | "customers"
    | "inventory"
    | "messages"
    | "analytics"
    | "settings";
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

export interface CustomerAnalytics {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  avgOrderValue: number;
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
  reference: string; // Order ID, Restock ID, etc.
  createdBy: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: "whatsapp" | "sms";
  category: "order" | "promotional" | "notification";
  content: string;
  variables: string[]; // Available variables like {customerName}, {orderTotal}
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageCampaign {
  id: string;
  name: string;
  type: "whatsapp" | "sms";
  templateId: string;
  template: MessageTemplate;
  targetAudience: "all" | "recent_customers" | "high_value" | "inactive";
  customFilters?: CustomerFilter[];
  scheduledFor?: string;
  status: "draft" | "scheduled" | "sending" | "completed" | "failed";
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  sentAt?: string;
}

export interface CustomerFilter {
  field: "totalOrders" | "totalSpent" | "lastOrderDate" | "location";
  operator: "equals" | "greater_than" | "less_than" | "between" | "contains";
  value: string | number | [string | number, string | number];
}

export interface InvoiceData {
  orderId: string;
  customerType: "online" | "walkin";
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    returned?: boolean;
    returnedQuantity?: number;
  }[];
  modifications?: {
    type: "item_return" | "quantity_change" | "price_adjustment";
    itemId: string;
    oldValue: number;
    newValue: number;
    reason: string;
  }[];
}

export interface DeliverySettings {
  id: string;
  pincode: string;
  radiusKm: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  isActive: boolean;
  estimatedDeliveryDays: number;
}

export interface ShopSettings {
  id: string;
  shopName: string;
  shopAddress: string;
  phoneNumber: string;
  email: string;
  workingHours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
  deliverySettings: DeliverySettings;
  paymentMethods: {
    cashOnDelivery: boolean;
    onlinePayment: boolean;
    storePickup: boolean;
  };
  taxSettings: {
    gstNumber?: string;
    taxRate: number;
    includeTaxInPrice: boolean;
  };
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
  customerId?: string;
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

export interface CustomerFilter {
  totalOrdersRange?: {
    min: number;
    max: number;
  };
  totalSpentRange?: {
    min: number;
    max: number;
  };
  lastOrderDateRange?: {
    start: string;
    end: string;
  };
  location?: string;
}

export interface ExportOptions {
  type: "orders" | "products" | "customers" | "inventory";
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

export interface AdminCustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  filters: CustomerFilter;
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

export interface AdminMessageState {
  templates: MessageTemplate[];
  campaigns: MessageCampaign[];
  whatsappMessages: WhatsAppMessage[];
  smsMessages: SMSMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface AdminAnalyticsState {
  dashboardStats: DashboardStats | null;
  salesData: SalesData[];
  productAnalytics: ProductAnalytics[];
  customerAnalytics: CustomerAnalytics[];
  isLoading: boolean;
  error: string | null;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface AdminSettingsState {
  shopSettings: ShopSettings | null;
  deliverySettings: DeliverySettings[];
  isLoading: boolean;
  error: string | null;
}
