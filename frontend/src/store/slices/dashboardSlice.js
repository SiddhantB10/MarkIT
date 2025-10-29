import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardAPI } from '../../services/api';

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

// Initial state
const initialState = {
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
