export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  category: string;
  images: string[];
  stock: number;
  isEligibleForFreeDelivery: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id?: string;
  product?: Product;
  productId?: string;
  productName?: string;
  quantity: number;
  price: number;
  weight?: number;
  returned?: boolean;
  returnedQuantity?: number;
}

export interface Order {
  id: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  totalWeight?: number;
  deliveryType: "delivery" | "pickup";
  paymentMethod: "prepaid" | "cash_on_pickup";
  paymentStatus: "pending" | "completed" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  deliveryAddress?: Address;
  deliveryFee?: number;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalWeight: number;
  totalItems: number;
  deliveryFee: number;
  isEligibleForFreeDelivery: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  notifications: Notification[];
  activeModal?: string | null;
  modalData?: any;
  isGlobalLoading?: boolean;
  isSidebarCollapsed?: boolean;
  theme?: "light" | "dark";
  isSearchModalOpen?: boolean;
  bulkSelectedItems?: string[];
  confirmDialog?: ConfirmDialog | null;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  isVisible: boolean;
  autoHide?: boolean;
  duration?: number;
}

export interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface StockAlert {
  id: string;
  productId: string;
  product: Product;
  threshold: number;
  currentStock: number;
  isActive: boolean;
  createdAt: string;
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
