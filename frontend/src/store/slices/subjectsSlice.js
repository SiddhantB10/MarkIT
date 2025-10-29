import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subjectsAPI } from '../../services/api';

// Async thunks
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subjectsAPI.getAll();
      return response.data.subjects;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subjects');
    }
  }
);

export const createSubject = createAsyncThunk(
  'subjects/create',
  async (subjectData, { rejectWithValue }) => {
    try {
      const response = await subjectsAPI.create(subjectData);
      return response.data.subject;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subject');
    }
  }
);

export const updateSubject = createAsyncThunk(
  'subjects/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await subjectsAPI.update(id, data);
      return response.data.subject;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subject');
    }
  }
);

export const deleteSubject = createAsyncThunk(
  'subjects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await subjectsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subject');
    }
  }
);

export const fetchSubjectById = createAsyncThunk(
  'subjects/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await subjectsAPI.getById(id);
      return response.data.subject;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subject');
    }
  }
);

// Initial state
const initialState = {
  subjects: [],
  currentSubject: null,
  loading: false,
  error: null,
};

// Slice
const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSubject: (state, action) => {
      state.currentSubject = action.payload;
    },
    clearCurrentSubject: (state) => {
      state.currentSubject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all subjects
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
        state.error = null;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create subject
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects.push(action.payload);
        state.error = null;
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update subject
      .addCase(updateSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subjects.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.subjects[index] = action.payload;
        }
        if (state.currentSubject?._id === action.payload._id) {
          state.currentSubject = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete subject
      .addCase(deleteSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = state.subjects.filter(s => s._id !== action.payload);
        if (state.currentSubject?._id === action.payload) {
          state.currentSubject = null;
        }
        state.error = null;
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch subject by ID
      .addCase(fetchSubjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubject = action.payload;
        state.error = null;
      })
      .addCase(fetchSubjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentSubject, clearCurrentSubject } = subjectsSlice.actions;
export default subjectsSlice.reducer;
