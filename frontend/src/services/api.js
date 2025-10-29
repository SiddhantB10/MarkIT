import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If token is expired, try to refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await authAPI.refreshToken();
        const { token } = refreshResponse.data;
        
        localStorage.setItem('token', token);
        Cookies.set('token', token, { expires: 7 });
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        Cookies.remove('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    } else if (error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  refreshToken: () => api.post('/auth/refresh'),
  updateAttendanceGoal: (goal) => api.put('/users/attendance-goal', { attendanceGoal: goal }),
};

// Subjects API
export const subjectsAPI = {
  getAll: (params = {}) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (subjectData) => api.post('/subjects', subjectData),
  update: (id, subjectData) => api.put(`/subjects/${id}`, subjectData),
  delete: (id) => api.delete(`/subjects/${id}`),
  getStats: (id) => api.get(`/subjects/${id}/stats`),
  updateGoal: (id, goal) => api.put(`/subjects/${id}/goal`, { attendanceGoal: goal }),
  bulkUpdate: (subjects) => api.put('/subjects/bulk', { subjects }),
};

// Lectures API
export const lecturesAPI = {
  getAll: (params = {}) => api.get('/lectures', { params }),
  getById: (id) => api.get(`/lectures/${id}`),
  create: (lectureData) => api.post('/lectures', lectureData),
  update: (id, lectureData) => api.put(`/lectures/${id}`, lectureData),
  delete: (id) => api.delete(`/lectures/${id}`),
  getByDateRange: (startDate, endDate) => api.get(`/lectures/range/${startDate}/${endDate}`),
  getToday: () => api.get('/lectures/today/list'),
  getUpcoming: () => api.get('/lectures/upcoming/list'),
  bulkUpdateAttendance: (lectures) => api.put('/lectures/bulk-attendance', { lectures }),
  getStats: (params = {}) => api.get('/lectures/stats/overview', { params }),
  markAttendance: (attendanceData) => api.post('/lectures/mark-attendance', attendanceData),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard'),
  getAttendanceSummary: (params = {}) => api.get('/dashboard/attendance-summary', { params }),
  getAnalytics: () => api.get('/dashboard/analytics'),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getStats: () => api.get('/users/stats'),
  uploadAvatar: (avatar) => api.post('/users/avatar', { avatar }),
  updatePreferences: (preferences) => api.put('/users/preferences', { preferences }),
  deleteAccount: (password) => api.delete('/users/account', { data: { password } }),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export const formatApiResponse = (response) => {
  return {
    success: response.data?.success || true,
    data: response.data?.data || response.data,
    message: response.data?.message,
  };
};

// File upload utility (for future use)
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload Progress: ${progress}%`);
    },
  });
};

export default api;