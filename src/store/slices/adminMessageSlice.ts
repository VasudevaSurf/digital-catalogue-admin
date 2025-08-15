import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminMessageState,
  MessageTemplate,
  MessageCampaign,
  WhatsAppMessage,
  SMSMessage,
} from "@/types/admin";
import { api } from "@/lib/api";

const initialState: AdminMessageState = {
  templates: [],
  campaigns: [],
  whatsappMessages: [],
  smsMessages: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMessageTemplates = createAsyncThunk(
  "adminMessages/fetchTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<MessageTemplate[]>(
        "/api/admin/messages/templates"
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch templates"
      );
    }
  }
);

export const createMessageTemplate = createAsyncThunk(
  "adminMessages/createTemplate",
  async (templateData: Partial<MessageTemplate>, { rejectWithValue }) => {
    try {
      const response = await api.post<MessageTemplate>(
        "/api/admin/messages/templates",
        templateData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create template"
      );
    }
  }
);

export const fetchMessageCampaigns = createAsyncThunk(
  "adminMessages/fetchCampaigns",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<MessageCampaign[]>(
        "/api/admin/messages/campaigns"
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch campaigns"
      );
    }
  }
);

export const createMessageCampaign = createAsyncThunk(
  "adminMessages/createCampaign",
  async (campaignData: Partial<MessageCampaign>, { rejectWithValue }) => {
    try {
      const response = await api.post<MessageCampaign>(
        "/api/admin/messages/campaigns",
        campaignData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create campaign"
      );
    }
  }
);

export const fetchWhatsAppMessages = createAsyncThunk(
  "adminMessages/fetchWhatsAppMessages",
  async (params: { limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get<WhatsAppMessage[]>(
        `/api/admin/messages/whatsapp?limit=${params.limit || 50}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch WhatsApp messages"
      );
    }
  }
);

export const fetchSMSMessages = createAsyncThunk(
  "adminMessages/fetchSMSMessages",
  async (params: { limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get<SMSMessage[]>(
        `/api/admin/messages/sms?limit=${params.limit || 50}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch SMS messages"
      );
    }
  }
);

const adminMessageSlice = createSlice({
  name: "adminMessages",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Templates
      .addCase(fetchMessageTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessageTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchMessageTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createMessageTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload);
      })

      // Campaigns
      .addCase(fetchMessageCampaigns.fulfilled, (state, action) => {
        state.campaigns = action.payload;
      })

      .addCase(createMessageCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload);
      })

      // Messages
      .addCase(fetchWhatsAppMessages.fulfilled, (state, action) => {
        state.whatsappMessages = action.payload;
      })

      .addCase(fetchSMSMessages.fulfilled, (state, action) => {
        state.smsMessages = action.payload;
      });
  },
});

export const { clearError } = adminMessageSlice.actions;
export default adminMessageSlice.reducer;
