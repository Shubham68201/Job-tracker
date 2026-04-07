import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { applicationsApi } from "../../services/api";
import type { Application, ApplicationStatus } from "../../types";

interface ApplicationsState {
  items: Application[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchApplications = createAsyncThunk(
  "applications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await applicationsApi.getAll();
      return res.data.applications;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to fetch applications");
    }
  }
);

export const createApplication = createAsyncThunk(
  "applications/create",
  async (data: Partial<Application>, { rejectWithValue }) => {
    try {
      const res = await applicationsApi.create(data);
      return res.data.application;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to create application");
    }
  }
);

export const updateApplication = createAsyncThunk(
  "applications/update",
  async ({ id, data }: { id: string; data: Partial<Application> }, { rejectWithValue }) => {
    try {
      const res = await applicationsApi.update(id, data);
      return res.data.application;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to update application");
    }
  }
);

export const deleteApplication = createAsyncThunk(
  "applications/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await applicationsApi.delete(id);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to delete application");
    }
  }
);

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    moveApplication(
      state,
      action: PayloadAction<{ id: string; newStatus: ApplicationStatus; newOrder: number }>
    ) {
      const app = state.items.find((a) => a._id === action.payload.id);
      if (app) {
        app.status = action.payload.newStatus;
        app.order = action.payload.newOrder;
      }
    },
    reorderApplications(state, action: PayloadAction<Application[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a._id !== action.payload);
      });
  },
});

export const { moveApplication, reorderApplications } = applicationsSlice.actions;
export default applicationsSlice.reducer;
