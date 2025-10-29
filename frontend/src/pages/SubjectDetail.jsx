import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { subjectsAPI, lecturesAPI } from '../services/api';
import { useDataSync } from '../contexts/DataSyncContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TopNavbar from '../components/layout/TopNavbar';
import BackButton from '../components/ui/BackButton';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const SubjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddLectureModal, setShowAddLectureModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateAttendance } = useDataSync();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchSubjectDetails();
    fetchLectures();
  }, [id]);

  const fetchSubjectDetails = async () => {
    try {
      setLoading(true);
      const response = await subjectsAPI.getById(id);
      setSubject(response.data.data);
    } catch (error) {
      console.error('Failed to fetch subject:', error);
      toast.error('Failed to load subject details');
      navigate('/subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchLectures = async () => {
    try {
      const response = await lecturesAPI.getAll({ subjectId: id });
      setLectures(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch lectures:', error);
    }
  };

  const handleAddLecture = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Auto-generate title from subject name and date
      const lectureDate = new Date(data.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      const lectureData = {
        title: `${subject.name} - ${lectureDate}`,
        topic: subject.name,
        date: data.date,
        startTime: '09:00', // Default time
        endTime: '10:00', // Default time
        subjectId: id,
        status: data.status
      };
      
      await lecturesAPI.create(lectureData);
      toast.success('Lecture added successfully!');
      setShowAddLectureModal(false);
      reset();
      fetchLectures();
      fetchSubjectDetails(); // Refresh to update attendance stats
      
      // Update attendance across all components including dashboard
      await updateAttendance(id, lectureData);
    } catch (error) {
      console.error('Failed to add lecture:', error);
      toast.error(error.response?.data?.message || 'Failed to add lecture');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLectureStatus = async (lectureId, newStatus) => {
    try {
      await lecturesAPI.update(lectureId, { status: newStatus });
      fetchLectures();
      fetchSubjectDetails(); // Refresh to update attendance stats
      
      // Update attendance across all components including dashboard
      await updateAttendance(id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update lecture status:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await lecturesAPI.delete(lectureId);
        toast.success('Lecture deleted successfully!');
        fetchLectures();
        fetchSubjectDetails();
        
        // Update attendance across all components including dashboard
        await updateAttendance(id, { deleted: true });
      } catch (error) {
        console.error('Failed to delete lecture:', error);
        toast.error('Failed to delete lecture');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Subject not found</p>
      </div>
    );
  }

  const attendancePercentage = subject.attendancePercentage || 0;
  const isGoalMet = attendancePercentage >= 75;

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation */}
      <TopNavbar />
      
      {/* Main Content */}
      <div className="h-[calc(100vh-4rem)] w-full overflow-y-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="mb-6">
        <BackButton />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{subject.name}</h1>
          {subject.description && (
            <p className="text-white/60 mt-1">{subject.description}</p>
          )}
        </div>
        <motion.button
          onClick={() => setShowAddLectureModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Mark Attendance
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lectures</h3>
          <p className="text-3xl font-bold text-blue-600">{subject.totalLectures || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Attended</h3>
          <p className="text-3xl font-bold text-green-600">{subject.attendedLectures || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</h3>
          <p className={`text-3xl font-bold ${isGoalMet ? 'text-green-600' : 'text-orange-600'}`}>
            {attendancePercentage}%
          </p>
        </motion.div>
      </div>

      {/* Attendance Progress Bar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Progress</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">Goal: 75%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${isGoalMet ? 'bg-green-600' : 'bg-orange-600'}`}
            style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Attendance History</h2>
        
        {lectures.length > 0 ? (
          <div className="space-y-3">
            {lectures.map((lecture) => (
              <motion.div
                key={lecture._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {new Date(lecture.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateLectureStatus(lecture._id, 'present')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        lecture.status === 'present'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900'
                      }`}
                    >
                      ✓ Present
                    </button>
                    <button
                      onClick={() => handleUpdateLectureStatus(lecture._id, 'absent')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        lecture.status === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900'
                      }`}
                    >
                      ✗ Absent
                    </button>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteLecture(lecture._id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2"
                    title="Delete Lecture"
                  >
                    🗑️
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">�</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No attendance records yet</p>
            <button
              onClick={() => setShowAddLectureModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark Your First Attendance
            </button>
          </div>
        )}
      </div>

      {/* Add Lecture Modal */}
      {showAddLectureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Mark Attendance</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the date and mark your attendance for {subject.name}
            </p>
            
            <form onSubmit={handleSubmit(handleAddLecture)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  {...register('date', { 
                    required: 'Date is required',
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(23, 59, 59, 999); // Set to end of today
                      
                      if (selectedDate > today) {
                        return 'Cannot mark attendance for future dates';
                      }
                      return true;
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  You can only mark attendance for today or past dates
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attendance Status *
                </label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLectureModal(false);
                    reset();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Adding...' : 'Add Lecture'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default SubjectDetail;
