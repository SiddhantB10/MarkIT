const express = require('express');
const Subject = require('../models/Subject');
const Lecture = require('../models/Lecture');
const { validate, validateQuery, subjectSchemas, querySchemas } = require('../middleware/validation');
const { resourceOwner } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all subjects for logged in user
// @route   GET /api/subjects
// @access  Private
router.get('/', validateQuery(querySchemas.pagination), async (req, res, next) => {
  try {
    const { page, limit, sort = '-createdAt', search } = req.query;
    
    // Build query
    const query = { userId: req.user._id };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const subjects = await Subject.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('recentLectures', 'title date status')
      .lean();

    // Get total count for pagination
    const total = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      count: subjects.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: subjects
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate({
      path: 'lectures',
      options: { sort: { date: -1 }, limit: 20 }
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
router.post('/', validate(subjectSchemas.create), async (req, res, next) => {
  try {
    // Add user ID to the subject
    req.body.userId = req.user._id;

    // Check if subject with same name already exists for this user
    const existingSubject = await Subject.findOne({
      name: req.body.name,
      userId: req.user._id,
      isActive: true
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name already exists'
      });
    }

    const subject = await Subject.create(req.body);

    // Send real-time notification
    if (req.io) {
      req.io.to(req.user._id.toString()).emit('notification', {
        type: 'subject_created',
        message: `Subject "${subject.name}" created successfully`,
        data: { subjectId: subject._id, subjectName: subject.name }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
router.put('/:id', validate(subjectSchemas.update), async (req, res, next) => {
  try {
    let subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if updating name and it conflicts with another subject
    if (req.body.name && req.body.name !== subject.name) {
      const existingSubject = await Subject.findOne({
        name: req.body.name,
        userId: req.user._id,
        isActive: true,
        _id: { $ne: req.params.id }
      });

      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this name already exists'
        });
      }
    }

    subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Send real-time notification
    if (req.io) {
      req.io.to(req.user._id.toString()).emit('notification', {
        type: 'subject_updated',
        message: `Subject "${subject.name}" updated successfully`,
        data: { subjectId: subject._id, subjectName: subject.name }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if subject has lectures
    const lectureCount = await Lecture.countDocuments({ subjectId: req.params.id });
    
    if (lectureCount > 0) {
      // Soft delete - just mark as inactive
      await Subject.findByIdAndUpdate(req.params.id, { isActive: false });
      
      return res.status(200).json({
        success: true,
        message: 'Subject archived successfully (has existing lectures)'
      });
    }

    // Hard delete if no lectures
    await Subject.findByIdAndDelete(req.params.id);

    // Send real-time notification
    if (req.io) {
      req.io.to(req.user._id.toString()).emit('notification', {
        type: 'subject_deleted',
        message: `Subject "${subject.name}" deleted successfully`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get subject statistics
// @route   GET /api/subjects/:id/stats
// @access  Private
router.get('/:id/stats', async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Get detailed lecture statistics
    const lectureStats = await Lecture.aggregate([
      {
        $match: { subjectId: subject._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly attendance trend
    const monthlyTrend = await Lecture.aggregate([
      {
        $match: { subjectId: subject._id }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [
                { $in: ['$status', ['present', 'late', 'excused']] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          total: 1,
          present: 1,
          percentage: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
            ]
          }
        }
      },
      {
        $sort: { year: 1, month: 1 }
      }
    ]);

    // Get recent lectures
    const recentLectures = await Lecture.find({ subjectId: subject._id })
      .sort({ date: -1 })
      .limit(10)
      .select('title date status topic');

    // Format lecture stats
    const statsMap = {};
    lectureStats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });

    const stats = {
      present: statsMap.present || 0,
      absent: statsMap.absent || 0,
      late: statsMap.late || 0,
      excused: statsMap.excused || 0,
      total: subject.totalLectures,
      percentage: subject.attendancePercentage
    };

    res.status(200).json({
      success: true,
      data: {
        subject: {
          _id: subject._id,
          name: subject.name,
          code: subject.code,
          color: subject.color
        },
        stats,
        monthlyTrend,
        recentLectures,
        meetsGoal: subject.meetsAttendanceGoal(req.user.attendanceGoal)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update subject attendance goal
// @route   PUT /api/subjects/:id/goal
// @access  Private
router.put('/:id/goal', async (req, res, next) => {
  try {
    const { attendanceGoal } = req.body;

    if (typeof attendanceGoal !== 'number' || attendanceGoal < 0 || attendanceGoal > 100) {
      return res.status(400).json({
        success: false,
        message: 'Attendance goal must be a number between 0 and 100'
      });
    }

    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Update user's global attendance goal
    await req.user.updateOne({ attendanceGoal });

    res.status(200).json({
      success: true,
      message: 'Attendance goal updated successfully',
      data: {
        attendanceGoal,
        meetsGoal: subject.meetsAttendanceGoal(attendanceGoal)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk update subjects
// @route   PUT /api/subjects/bulk
// @access  Private
router.put('/bulk', async (req, res, next) => {
  try {
    const { subjects } = req.body;

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subjects array is required'
      });
    }

    const updatePromises = subjects.map(async (subjectData) => {
      const { _id, ...updateData } = subjectData;
      
      return Subject.findOneAndUpdate(
        { _id, userId: req.user._id },
        updateData,
        { new: true, runValidators: true }
      );
    });

    const updatedSubjects = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `${updatedSubjects.length} subjects updated successfully`,
      data: updatedSubjects.filter(Boolean) // Remove null results
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;