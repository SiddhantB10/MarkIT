import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataSyncProvider } from './contexts/DataSyncContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataSyncProvider>
          <Router>
          <div className="h-screen w-screen bg-background text-foreground">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute>
                    <Subjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subjects/:id"
                element={
                  <ProtectedRoute>
                    <SubjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            <Toaster position="top-right" />
          </div>
        </Router>
        </DataSyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;