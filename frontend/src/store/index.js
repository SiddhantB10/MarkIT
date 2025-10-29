import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import subjectsReducer from './slices/subjectsSlice';
import dashboardReducer from './slices/dashboardSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectsReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
