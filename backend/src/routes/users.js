const express = require('express');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('totalSubjects totalLectures')
      .lean();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
router.post('/avatar', async (req, res, next) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Avatar URL is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'profile.avatar': avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatar: user.profile.avatar }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    const Subject = require('../models/Subject');
    const Lecture = require('../models/Lecture');
    
    const userId = req.user._id;
    
    // Get basic stats
    const [subjectStats, lectureStats] = await Promise.all([
      Subject.getUserSubjectStats(userId),
      Lecture.getAttendanceStats(userId, new Date('2020-01-01'), new Date())
    ]);
    
    // Get monthly activity
    const monthlyActivity = await Lecture.aggregate([
      {
        $match: { userId }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $in: ['$status', ['present', 'late', 'excused']] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      { $limit: 12 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          ...subjectStats,
          ...lectureStats
        },
        monthlyActivity: monthlyActivity.reverse()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', async (req, res, next) => {
  try {
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'Preferences are required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update attendance goal
// @route   PUT /api/users/attendance-goal
// @access  Private
router.put('/attendance-goal', async (req, res, next) => {
  try {
    const { attendanceGoal } = req.body;

    if (typeof attendanceGoal !== 'number' || attendanceGoal < 0 || attendanceGoal > 100) {
      return res.status(400).json({
        success: false,
        message: 'Attendance goal must be a number between 0 and 100'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { attendanceGoal },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Attendance goal updated successfully',
      data: { 
        attendanceGoal: user.attendanceGoal,
        preferences: user.preferences 
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Delete related data
    const Subject = require('../models/Subject');
    const Lecture = require('../models/Lecture');
    
    await Promise.all([
      Subject.deleteMany({ userId: req.user._id }),
      Lecture.deleteMany({ userId: req.user._id }),
      User.findByIdAndDelete(req.user._id)
    ]);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes
// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, sort = '-createdAt' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .populate('totalSubjects totalLectures')
      .lean();

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('totalSubjects totalLectures')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete related data
    const Subject = require('../models/Subject');
    const Lecture = require('../models/Lecture');
    
    await Promise.all([
      Subject.deleteMany({ userId: req.params.id }),
      Lecture.deleteMany({ userId: req.params.id }),
      User.findByIdAndDelete(req.params.id)
    ]);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/admin/stats
// @access  Private/Admin
router.get('/admin/stats', adminAuth, async (req, res, next) => {
  try {
    const userStats = await User.getUserStats();
    
    const Subject = require('../models/Subject');
    const Lecture = require('../models/Lecture');
    
    const [totalSubjects, totalLectures] = await Promise.all([
      Subject.countDocuments(),
      Lecture.countDocuments()
    ]);
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        users: userStats,
        subjects: totalSubjects,
        lectures: totalLectures,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;