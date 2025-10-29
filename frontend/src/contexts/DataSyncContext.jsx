import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { subjectsAPI, dashboardAPI, usersAPI, authAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const DataSyncContext = createContext();

// Data sync reducer
const dataSyncReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_DASHBOARD_DATA':
      return { ...state, dashboardData: action.payload };
    
    case 'SET_SUBJECTS':
      return { ...state, subjects: action.payload };
    
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map(subject =>
          subject._id === action.payload._id ? action.payload : subject
        ),
      };
    
    case 'ADD_SUBJECT':
      return {
        ...state,
        subjects: [...state.subjects, action.payload],
      };
    
    case 'DELETE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.filter(subject => subject._id !== action.payload),
      };
    
    case 'UPDATE_ATTENDANCE':
      // Update both subjects and dashboard data when attendance changes
      const updatedSubjects = state.subjects.map(subject => {
        if (subject._id === action.payload.subjectId) {
          return {
            ...subject,
            ...action.payload.subjectData,
          };
        }
        return subject;
      });
      
      return {
        ...state,
        subjects: updatedSubjects,
        dashboardData: {
          ...state.dashboardData,
          ...action.payload.dashboardData,
        },
      };
    
    case 'SET_USER_PREFERENCES':
      return { ...state, userPreferences: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

const initialState = {
  dashboardData: null,
  subjects: [],
  userPreferences: {
    attendanceGoal: 75,
    theme: 'system',
  },
  loading: false,
  error: null,
};

export const DataSyncProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataSyncReducer, initialState);
  const { user } = useAuth();

  // Initialize user preferences when user changes
  useEffect(() => {
    if (user) {
      dispatch({ 
        type: 'SET_USER_PREFERENCES', 
        payload: {
          attendanceGoal: user.attendanceGoal || 75,
          theme: user.preferences?.theme || 'system',
        }
      });
    }
  }, [user]);

  // Fetch all data and sync
  const syncAllData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Fetch data in parallel
      const [dashboardResponse, subjectsResponse] = await Promise.all([
        dashboardAPI.getOverview(),
        subjectsAPI.getAll(),
      ]);

      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardResponse.data });
      dispatch({ type: 'SET_SUBJECTS', payload: subjectsResponse.data.data || [] });
      
    } catch (error) {
      console.error('Sync error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync data' });
      toast.error('Failed to sync data');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Update attendance and sync across all components
  const updateAttendance = useCallback(async (subjectId, lectureData) => {
    try {
      // The lecture update will be handled by the component, 
      // this function ensures data sync after the update
      await syncAllData();
      // Toast will be handled by the calling component to avoid duplicates
    } catch (error) {
      console.error('Attendance update error:', error);
      toast.error('Failed to sync attendance data');
    }
  }, [syncAllData]);

  // Add subject and sync
  const addSubject = useCallback(async (subjectData) => {
    try {
      const response = await subjectsAPI.create(subjectData);
      dispatch({ type: 'ADD_SUBJECT', payload: response.data.data });
      
      // Refresh dashboard data to reflect new subject
      const dashboardResponse = await dashboardAPI.getOverview();
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardResponse.data });
      
      toast.success('Subject added successfully');
      return response.data.data;
    } catch (error) {
      console.error('Add subject error:', error);
      toast.error('Failed to add subject');
      throw error;
    }
  }, []);

  // Update subject and sync
  const updateSubject = useCallback(async (subjectId, subjectData) => {
    try {
      const response = await subjectsAPI.update(subjectId, subjectData);
      dispatch({ type: 'UPDATE_SUBJECT', payload: response.data.data });
      
      // Refresh dashboard data to reflect changes
      const dashboardResponse = await dashboardAPI.getOverview();
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardResponse.data });
      
      toast.success('Subject updated successfully');
      return response.data.data;
    } catch (error) {
      console.error('Update subject error:', error);
      toast.error('Failed to update subject');
      throw error;
    }
  }, []);

  // Delete subject and sync
  const deleteSubject = useCallback(async (subjectId) => {
    try {
      await subjectsAPI.delete(subjectId);
      dispatch({ type: 'DELETE_SUBJECT', payload: subjectId });
      
      // Refresh dashboard data to reflect deletion
      const dashboardResponse = await dashboardAPI.getOverview();
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardResponse.data });
      
      toast.success('Subject deleted successfully');
    } catch (error) {
      console.error('Delete subject error:', error);
      toast.error('Failed to delete subject');
      throw error;
    }
  }, []);

  // Update user attendance goal (global preference)
  const updateUserAttendanceGoal = useCallback(async (goal) => {
    try {
      const response = await authAPI.updateAttendanceGoal(goal);
      
      // Update local state
      dispatch({ 
        type: 'SET_USER_PREFERENCES', 
        payload: { 
          ...state.userPreferences, 
          attendanceGoal: goal 
        } 
      });

      // Refresh dashboard data to reflect new goal calculations
      const dashboardResponse = await dashboardAPI.getOverview();
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardResponse.data });
      
      toast.success('Attendance goal updated successfully');
      return response;
    } catch (error) {
      console.error('Error updating user attendance goal:', error);
      toast.error('Failed to update attendance goal');
      throw error;
    }
  }, [state.userPreferences]);

  // Update user preferences
  const updateUserPreferences = useCallback(async (preferences) => {
    try {
      // Update local state immediately
      dispatch({ type: 'SET_USER_PREFERENCES', payload: { ...state.userPreferences, ...preferences } });
      
      // Here you would typically call an API to save preferences
      // await usersAPI.updatePreferences(preferences);
      
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Preferences update error:', error);
      toast.error('Failed to update preferences');
    }
  }, [state.userPreferences]);

  const value = {
    // State
    dashboardData: state.dashboardData,
    subjects: state.subjects,
    userPreferences: state.userPreferences,
    loading: state.loading,
    error: state.error,
    
    // Actions
    syncAllData,
    updateAttendance,
    addSubject,
    updateSubject,
    deleteSubject,
    updateUserPreferences,
    updateUserAttendanceGoal,
  };

  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
};

export const useDataSync = () => {
  const context = useContext(DataSyncContext);
  if (!context) {
    throw new Error('useDataSync must be used within a DataSyncProvider');
  }
  return context;
};

export default DataSyncContext;