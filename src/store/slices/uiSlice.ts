// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UIState, Notification } from "@/types";

const initialState: UIState = {
  isMobileMenuOpen: false,
  isCartOpen: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Mobile Menu Actions
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    openMobileMenu: (state) => {
      state.isMobileMenuOpen = true;
    },

    // Cart Actions (for main website)
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },

    // Notification Actions
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id">>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.isVisible = false;
      }
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Quick notification methods
    showSuccessNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "success",
        message: action.payload,
        isVisible: true,
        autoHide: true,
        duration: 5000,
      };
      state.notifications.push(notification);
    },

    showErrorNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "error",
        message: action.payload,
        isVisible: true,
        autoHide: true,
        duration: 7000,
      };
      state.notifications.push(notification);
    },

    showInfoNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "info",
        message: action.payload,
        isVisible: true,
        autoHide: true,
        duration: 5000,
      };
      state.notifications.push(notification);
    },

    showWarningNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "warning",
        message: action.payload,
        isVisible: true,
        autoHide: true,
        duration: 6000,
      };
      state.notifications.push(notification);
    },

    // Modal/Drawer Actions (for admin panel and main site)
    openModal: (
      state,
      action: PayloadAction<{ modalId: string; data?: any }>
    ) => {
      // You can extend this to handle multiple modals
      state.activeModal = action.payload.modalId;
      state.modalData = action.payload.data;
    },

    closeModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },

    // Loading States (global loading)
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalLoading = action.payload;
    },

    // Sidebar toggle (for admin panel)
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },

    // Theme toggle (if you want dark/light mode)
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },

    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },

    // Search modal (for both main site and admin)
    toggleSearchModal: (state) => {
      state.isSearchModalOpen = !state.isSearchModalOpen;
    },

    openSearchModal: (state) => {
      state.isSearchModalOpen = true;
    },

    closeSearchModal: (state) => {
      state.isSearchModalOpen = false;
    },

    // Bulk actions (for admin tables)
    setBulkSelection: (state, action: PayloadAction<string[]>) => {
      state.bulkSelectedItems = action.payload;
    },

    toggleBulkSelection: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const currentSelection = state.bulkSelectedItems || [];

      if (currentSelection.includes(itemId)) {
        state.bulkSelectedItems = currentSelection.filter(
          (id) => id !== itemId
        );
      } else {
        state.bulkSelectedItems = [...currentSelection, itemId];
      }
    },

    clearBulkSelection: (state) => {
      state.bulkSelectedItems = [];
    },

    // Confirmation dialog
    showConfirmDialog: (
      state,
      action: PayloadAction<{
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
        onCancel?: () => void;
      }>
    ) => {
      state.confirmDialog = {
        isOpen: true,
        ...action.payload,
      };
    },

    hideConfirmDialog: (state) => {
      state.confirmDialog = null;
    },
  },
});

export const {
  // Mobile Menu
  toggleMobileMenu,
  closeMobileMenu,
  openMobileMenu,

  // Cart
  toggleCart,
  closeCart,
  openCart,

  // Notifications
  addNotification,
  removeNotification,
  markNotificationAsRead,
  clearNotifications,
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
  showWarningNotification,

  // Modals
  openModal,
  closeModal,

  // Loading
  setGlobalLoading,

  // Sidebar
  toggleSidebar,
  setSidebarCollapsed,

  // Theme
  toggleTheme,
  setTheme,

  // Search
  toggleSearchModal,
  openSearchModal,
  closeSearchModal,

  // Bulk Selection
  setBulkSelection,
  toggleBulkSelection,
  clearBulkSelection,

  // Confirmation Dialog
  showConfirmDialog,
  hideConfirmDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
