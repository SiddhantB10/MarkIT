import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useDataSync } from '../contexts/DataSyncContext';
import { 
  GlassCard, 
  StandardButton, 
  PageHeader, 
  FloatingParticles, 
  StandardInput,
  commonAnimations,
  Alert
} from '../components/ui/StandardComponents';
import TopNavbar from '../components/layout/TopNavbar';
import BackButton from '../components/ui/BackButton';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { usersAPI, authAPI } from '../services/api';

const Settings = () => {
  const { user, logout } = useAuth();
  const { userPreferences, updateUserPreferences, updateUserAttendanceGoal } = useDataSync();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [attendanceGoal, setAttendanceGoal] = useState(75);

  // Password change form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
    watch: watchPassword
  } = useForm();

  // Delete account form
  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    reset: resetDeleteForm,
    formState: { errors: deleteErrors }
  } = useForm();

  useEffect(() => {
    // Load attendance goal from DataSyncContext
    if (userPreferences?.attendanceGoal) {
      setAttendanceGoal(userPreferences.attendanceGoal);
    }
  }, [userPreferences]);

  const handleAttendanceGoalChange = async (newGoal) => {
    try {
      setIsUpdating(true);
      // Use DataSyncContext to update attendance goal and sync across components
      await updateUserAttendanceGoal(newGoal);
      setAttendanceGoal(newGoal);
    } catch (error) {
      console.error('Failed to update attendance goal:', error);
      // The error toast is already handled in the DataSyncContext
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (data) => {
    try {
      setIsUpdating(true);
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully!');
      resetPasswordForm();
    } catch (error) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async (data) => {
    try {
      setIsUpdating(true);
      await usersAPI.deleteAccount(data.confirmPassword);
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete account';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
      setShowDeleteConfirmation(false);
    }
  };

  const newPassword = watchPassword('newPassword', '');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.3),transparent)]"></div>
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100, null],
              x: [null, Math.random() * 200 - 100, null],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Top Navigation */}
      <TopNavbar />

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100vh-4rem)] w-full overflow-y-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            variants={commonAnimations.containerVariants}
            initial="hidden"
            animate="visible"
          >
          {/* Back Button */}
          <motion.div variants={commonAnimations.itemVariants} className="mb-6">
            <BackButton />
          </motion.div>

          <PageHeader
            title="Settings"
            subtitle="Manage your account preferences and security"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Attendance Goal Section */}
            <motion.div variants={commonAnimations.itemVariants}>
              <GlassCard variant="default" gradient="from-blue-500/10 to-purple-500/10">
                <h2 className="text-2xl font-bold text-white mb-6">Attendance Goal</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-3">
                      Target Attendance Percentage
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={attendanceGoal}
                        onChange={(e) => setAttendanceGoal(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-2xl font-bold text-white min-w-[4rem]">{attendanceGoal}%</span>
                    </div>
                  </div>
                  
                  <StandardButton
                    variant="primary"
                    size="medium"
                    className="w-full"
                    onClick={() => handleAttendanceGoalChange(attendanceGoal)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Goal'}
                  </StandardButton>

                  <Alert type="info" className="text-sm">
                    Your attendance goal helps track your progress. The system will show warnings when you fall below this threshold.
                  </Alert>
                </div>
              </GlassCard>
            </motion.div>

            {/* Change Password Section */}
            <motion.div variants={commonAnimations.itemVariants}>
              <GlassCard variant="default" gradient="from-green-500/10 to-teal-500/10">
                <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit(handleChangePassword)} className="space-y-6">
                  <StandardInput
                    label="Current Password"
                    type="password"
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    placeholder="Enter current password"
                    error={passwordErrors.currentPassword?.message}
                  />

                  <StandardInput
                    label="New Password"
                    type="password"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain uppercase, lowercase, and number'
                      }
                    })}
                    placeholder="Enter new password"
                    error={passwordErrors.newPassword?.message}
                  />

                  <StandardInput
                    label="Confirm New Password"
                    type="password"
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === newPassword || 'Passwords do not match'
                    })}
                    placeholder="Confirm new password"
                    error={passwordErrors.confirmPassword?.message}
                  />

                  <StandardButton
                    type="submit"
                    variant="primary"
                    size="medium"
                    className="w-full"
                    disabled={isUpdating}
                    gradient="var(--gradient-secondary)"
                  >
                    {isUpdating ? 'Changing...' : 'Change Password'}
                  </StandardButton>
                </form>
              </GlassCard>
            </motion.div>

            {/* Delete Account Section */}
            <motion.div variants={commonAnimations.itemVariants} className="lg:col-span-2">
              <GlassCard variant="default" gradient="from-red-500/10 to-red-600/10" className="border-red-500/20">
                <h2 className="text-2xl font-bold text-red-400 mb-6">Danger Zone</h2>
                <div className="space-y-6">
                  <Alert type="error">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Account</h3>
                    <p className="text-red-200 text-sm">
                      Once you delete your account, there is no going back. Please be certain. All your data including subjects, lectures, and attendance records will be permanently deleted.
                    </p>
                  </Alert>
                  
                  {!showDeleteConfirmation ? (
                    <StandardButton
                      variant="danger"
                      size="medium"
                      onClick={() => setShowDeleteConfirmation(true)}
                    >
                      Delete Account
                    </StandardButton>
                  ) : (
                    <form onSubmit={handleDeleteSubmit(handleDeleteAccount)} className="space-y-6">
                      <StandardInput
                        label="Type your password to confirm deletion"
                        type="password"
                        {...registerDelete('confirmPassword', { required: 'Password is required to delete account' })}
                        placeholder="Enter your password"
                        error={deleteErrors.confirmPassword?.message}
                        className="border-red-500/50 focus:ring-red-500"
                      />

                      <div className="flex space-x-4">
                        <StandardButton
                          type="submit"
                          variant="danger"
                          size="medium"
                          className="flex-1"
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Deleting...' : 'Yes, Delete My Account'}
                        </StandardButton>
                        <StandardButton
                          variant="secondary"
                          size="medium"
                          className="flex-1"
                          onClick={() => {
                            setShowDeleteConfirmation(false);
                            resetDeleteForm();
                          }}
                        >
                          Cancel
                        </StandardButton>
                      </div>
                    </form>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Settings;