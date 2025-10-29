import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import TopNavbar from '../components/layout/TopNavbar';
import BackButton from '../components/ui/BackButton';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Only include password if user is changing it
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        if (!formData.currentPassword) {
          toast.error('Current password is required to change password');
          setLoading(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      const result = await updateProfile(updateData);
      
      if (result.success) {
        setIsEditing(false);
        // Clear password fields
        setFormData({
          name: formData.name,
          email: formData.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation */}
      <TopNavbar />
      
      {/* Main Content */}
      <div className="h-[calc(100vh-4rem)] w-full overflow-y-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-white/60">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          {/* Profile Header with Avatar */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-blue-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-blue-100">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:bg-muted disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:bg-muted disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Change Password Section - Only shown when editing */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-border pt-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Leave blank if you don't want to change your password
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons - Only shown when editing */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
