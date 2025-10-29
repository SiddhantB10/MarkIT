import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDataSync } from '../contexts/DataSyncContext';
import { 
  GlassCard, 
  StandardButton, 
  PageHeader, 
  FloatingParticles, 
  Modal,
  StandardInput,
  commonAnimations,
  LoadingSpinner
} from '../components/ui/StandardComponents';
import TopNavbar from '../components/layout/TopNavbar';
import BackButton from '../components/ui/BackButton';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const Subjects = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    subjects,
    loading,
    syncAllData,
    addSubject
  } = useDataSync();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    syncAllData();
  }, [syncAllData]);

  const handleAddSubject = async (data) => {
    try {
      setIsSubmitting(true);
      await addSubject(data);
      setShowAddModal(false);
      reset();
    } catch (error) {
      // Error already handled in DataSyncContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const { deleteSubject } = useDataSync();

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(subjectId);
      } catch (error) {
        // Error already handled in DataSyncContext
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
        <FloatingParticles count={20} />
        <div className="relative z-10">
          <LoadingSpinner size="large" />
        </div>
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
          className="max-w-7xl mx-auto w-full"
          variants={commonAnimations.containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.div variants={commonAnimations.itemVariants} className="mb-6">
            <BackButton />
          </motion.div>

          <PageHeader
            title="Subjects"
            subtitle="Manage your subjects and track attendance"
          />

          {/* Add Subject Button */}
          <motion.div variants={commonAnimations.itemVariants} className="mb-8 flex justify-end">
            <StandardButton
              variant="primary"
              size="medium"
              onClick={() => setShowAddModal(true)}
            >
              Add Subject
            </StandardButton>
          </motion.div>
          
          {subjects.length === 0 ? (
            <motion.div variants={commonAnimations.itemVariants}>
              <GlassCard variant="large" className="text-center">
                <div className="text-6xl mb-6">📚</div>
                <h3 className="text-2xl font-bold text-white mb-3">No Subjects Yet</h3>
                <p className="text-gray-300 mb-8 text-lg">Start by adding your first subject to track attendance.</p>
                <StandardButton
                  variant="primary"
                  size="large"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Your First Subject
                </StandardButton>
              </GlassCard>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject._id}
                  variants={commonAnimations.itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard 
                    hoverable
                    className="cursor-pointer group"
                    onClick={() => navigate(`/subjects/${subject._id}`)}
                    gradient="from-blue-500/10 to-purple-500/10"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                          {subject.name}
                        </h3>
                        {subject.description && (
                          <p className="text-gray-300 mt-2 text-sm">{subject.description}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(subject._id);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/20"
                        title="Delete Subject"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Attendance</span>
                        <span className="text-white font-semibold">
                          {subject.attendancePercentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(subject.attendancePercentage || 0, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Total Lectures: {subject.totalLectures || 0}</span>
                        <span>Attended: {subject.attendedLectures || 0}</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Subject Modal */}
          <Modal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              reset();
            }}
            title="Add New Subject"
            size="small"
          >
            <form onSubmit={handleSubmit(handleAddSubject)} className="space-y-6">
              <StandardInput
                label="Subject Name *"
                {...register('name', { required: 'Subject name is required' })}
                placeholder="e.g., Mathematics"
                error={errors.name?.message}
              />

              <StandardInput
                label="Description"
                {...register('description')}
                placeholder="Optional description..."
                as="textarea"
                rows={3}
              />

              <StandardInput
                label="Instructor Name"
                {...register('instructor.name')}
                placeholder="e.g., Dr. Smith"
              />

              <div className="flex gap-3 pt-2">
                <StandardButton
                  variant="secondary"
                  size="medium"
                  className="flex-1"
                  onClick={() => {
                    setShowAddModal(false);
                    reset();
                  }}
                >
                  Cancel
                </StandardButton>
                <StandardButton
                  type="submit"
                  variant="primary"
                  size="medium"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Subject'}
                </StandardButton>
              </div>
            </form>
          </Modal>
        </motion.div>
      </div>
    </div>
  );
};

export default Subjects;