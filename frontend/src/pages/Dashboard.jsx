import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useDataSync } from '../contexts/DataSyncContext';
import { 
  GlassCard, 
  StandardButton, 
  PageHeader, 
  StatsCard, 
  FloatingParticles, 
  Modal,
  StandardInput,
  Alert,
  commonAnimations,
  LoadingSpinner 
} from '../components/ui/StandardComponents';
import TopNavbar from '../components/layout/TopNavbar';
import BackButton from '../components/ui/BackButton';
import { useState } from 'react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    description: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const { user } = useAuth();
  const { 
    dashboardData, 
    subjects, 
    loading, 
    error, 
    syncAllData, 
    addSubject 
  } = useDataSync();
  const navigate = useNavigate();

  useEffect(() => {
    syncAllData();
  }, [syncAllData]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      setSubmitLoading(true);
      await addSubject(subjectForm);
      setSubjectForm({ name: '', description: '' });
      setShowAddSubjectModal(false);
    } catch (err) {
      // Error already handled in DataSyncContext
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInitDemoData = async () => {
    if (subjects.length > 0) {
      toast.error('You already have subjects. Delete them first to create demo data.');
      return;
    }
    
    if (!window.confirm('This will create demo subjects with attendance data. Continue?')) {
      return;
    }

    try {
      setSubmitLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/dashboard/init-demo-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        toast.success('Demo data created successfully!');
        syncAllData(); // Refresh all data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create demo data');
      }
    } catch (error) {
      console.error('Failed to create demo data:', error);
      toast.error('Failed to create demo data');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Using standardized animations from StandardComponents
  const { containerVariants, itemVariants, cardHoverVariants } = commonAnimations;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="relative z-10"
        >
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent)] animate-pulse"></div>
      </div>
      
      {/* Floating Particles */}
      <FloatingParticles count={30} />

      {/* Top Navigation */}
      <TopNavbar />

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100vh-4rem)] w-full overflow-y-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto w-full"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-6">
            <BackButton to="/" label="Back to Home" />
          </motion.div>

          {/* Header */}
          <PageHeader
            title={`Welcome back, ${user?.name}!`}
            subtitle="Your attendance dashboard awaits"
          />

          {error && (
            <Alert type="error" className="mb-8" dismissible>
              {error}
            </Alert>
          )}

          {/* Demo Data Button - Show only when no subjects exist */}
          {subjects.length === 0 && (
            <motion.div 
              variants={itemVariants}
              className="flex justify-center mb-8"
            >
              <button
                onClick={handleInitDemoData}
                disabled={submitLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {submitLoading ? 'Creating...' : '🚀 Create Demo Data to Test'}
              </button>
            </motion.div>
          )}

          {/* Overall Attendance Percentage */}
          {dashboardData && (
            <motion.div 
              variants={itemVariants}
              className="flex justify-center mb-12"
            >
              <StatsCard
                title="Overall Attendance"
                value={`${Math.round(dashboardData.overview?.averageAttendance || 0)}%`}
                subtitle="Keep up the great work!"
                gradient="from-emerald-500/20 to-teal-500/20"
                iconGradient="from-emerald-500 to-teal-600"
                icon={() => (
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
              />
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/subjects">
                <GlassCard 
                  hoverable 
                  gradient="from-indigo-500/20 to-purple-500/20" 
                  className="group"
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-white mb-1">
                        Manage Subjects
                      </h3>
                      <p className="text-gray-300 text-sm">
                        View and manage subjects
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Link>

              <GlassCard 
                hoverable 
                gradient="from-green-500/20 to-emerald-500/20" 
                className="group cursor-pointer"
                onClick={() => setShowAddSubjectModal(true)}
              >
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-white mb-1">
                      Add Subject
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Create a new subject
                    </p>
                  </div>
                </div>
              </GlassCard>

              <Link to="/settings">
                <GlassCard 
                  hoverable 
                  gradient="from-blue-500/20 to-cyan-500/20" 
                  className="group"
                >
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-white mb-1">
                        Settings
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Manage preferences
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Add Subject Modal */}
      <Modal
        isOpen={showAddSubjectModal}
        onClose={() => {
          setShowAddSubjectModal(false);
          setSubjectForm({ name: '', description: '' });
        }}
        title="Add New Subject"
        size="small"
      >
        <form onSubmit={handleAddSubject} className="space-y-6">
          <StandardInput
            label="Subject Name *"
            value={subjectForm.name}
            onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
            placeholder="Enter subject name"
            required
          />
          
          <StandardInput
            label="Description"
            value={subjectForm.description}
            onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
            placeholder="Optional description"
            as="textarea"
            rows={2}
          />
          
          <div className="flex gap-3 pt-2">
            <StandardButton
              variant="secondary"
              size="medium"
              className="flex-1"
              onClick={() => {
                setShowAddSubjectModal(false);
                setSubjectForm({ name: '', description: '' });
              }}
            >
              Cancel
            </StandardButton>
            <StandardButton
              type="submit"
              variant="primary"
              size="medium"
              className="flex-1"
              disabled={submitLoading}
            >
              {submitLoading ? 'Adding...' : 'Add Subject'}
            </StandardButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;