// src/store/slices/adminAuthSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AdminAuthState, AdminUser } from "@/types/admin";
import { api } from "@/lib/api";

const initialState: AdminAuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
};

export const adminLogin = createAsyncThunk(
  "adminAuth/login",
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post<{
        success: boolean;
        user: AdminUser;
        token?: string;
      }>("/api/auth/login", {
        username,
        password,
      });

      // The token is set as httpOnly cookie by the server
      // So we don't need to store it in localStorage

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to login"
      );
    }
  }
);

export const loadAdminUser = createAsyncThunk(
  "adminAuth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      // For Next.js with httpOnly cookies, we verify through the server
      const response = await api.get<{ success: boolean; user: AdminUser }>(
        "/api/auth/verify"
      );
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load user"
      );
    }
  }
);

export const adminLogout = createAsyncThunk(
  "adminAuth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/auth/logout");
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to logout"
      );
    }
  }
);

export const updateAdminProfile = createAsyncThunk(
  "adminAuth/updateProfile",
  async (userData: Partial<AdminUser>, { rejectWithValue }) => {
    try {
      const response = await api.put<AdminUser>(
        "/api/auth/admin/profile",
        userData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

export const changeAdminPassword = createAsyncThunk(
  "adminAuth/changePassword",
  async (
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      await api.post("/api/auth/admin/change-password", {
        currentPassword,
        newPassword,
      });
      return true;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }
);

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAdminUser: (state, action: PayloadAction<AdminUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Load Admin User
      .addCase(loadAdminUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadAdminUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadAdminUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Admin Logout
      .addCase(adminLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })

      // Update Admin Profile
      .addCase(updateAdminProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Change Password
      .addCase(changeAdminPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeAdminPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changeAdminPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setAdminUser } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
