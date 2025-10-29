import { createContext, useContext, useEffect, useReducer } from 'react';
import { authAPI } from '../services/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || Cookies.get('token');
      
      if (token) {
        try {
          const response = await authAPI.getMe();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.user,
              token,
            },
          });
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          Cookies.remove('token');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      // Store token
      localStorage.setItem('token', token);
      Cookies.set('token', token, { expires: 7 }); // 7 days

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authAPI.register(userData);
      const { user, token } = response.data;

      // Store token
      localStorage.setItem('token', token);
      Cookies.set('token', token, { expires: 7 });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`Welcome to MarkIt, ${user.name}!`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage regardless of API call success
      localStorage.removeItem('token');
      Cookies.remove('token');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authAPI.updateProfile(profileData);
      
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user,
      });
      
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authAPI.changePassword(passwordData);
      
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      Cookies.set('token', token, { expires: 7 });
      
      return { success: true, token };
    } catch (error) {
      // If refresh fails, logout user
      logout();
      return { success: false };
    }
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};