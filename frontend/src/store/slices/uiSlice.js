import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  theme: localStorage.getItem('theme') || 'system',
  sidebarOpen: true,
  notifications: [],
  modals: {
    createSubject: false,
    editSubject: false,
    deleteConfirm: false,
  },
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notif => notif.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
} = uiSlice.actions;

export default uiSlice.reducer;
