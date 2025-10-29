const express = require('express');
const Lecture = require('../models/Lecture');
const Subject = require('../models/Subject');
const { validate, validateQuery, lectureSchemas, querySchemas } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all lectures for logged in user
// @route   GET /api/lectures
// @access  Private
router.get('/', validateQuery(querySchemas.pagination), async (req, res, next) => {
  try {
    const { page, limit, sort = '-date', search, subjectId, status, startDate, endDate } = req.query;
    
    // Build query
    const query = { userId: req.user._id };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const lectures = await Lecture.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('subjectId', 'name code color')
      .lean();

    // Get total count for pagination
    const total = await Lecture.countDocuments(query);

    res.status(200).json({
      success: true,
      count: lectures.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: lectures
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single lecture
// @route   GET /api/lectures/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const lecture = await Lecture.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('subjectId', 'name code color instructor');

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lecture
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new lecture
// @route   POST /api/lectures
// @access  Private
router.post('/', validate(lectureSchemas.create), async (req, res, next) => {
  try {
    // Add user ID to the lecture
    req.body.userId = req.user._id;

    // Verify that the subject belongs to the user
    const subject = await Subject.findOne({
      _id: req.body.subjectId,
      userId: req.user._id,
      isActive: true
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or not accessible'
      });
    }

    // Check for duplicate lectures on the same date for the same subject
    const existingLecture = await Lecture.findOne({
      subjectId: req.body.subjectId,
      date: req.body.date,
      startTime: req.body.startTime
    });

    if (existingLecture) {
      return res.status(400).json({
        success: false,
        message: 'A lecture already exists for this subject at the same date and time'
      });
    }

    const lecture = await Lecture.create(req.body);
    
    // Populate subject details
    await lecture.populate('subjectId', 'name code color');

    // Update subject statistics
    await Subject.updateSubjectStats(lecture.subjectId._id);

    // Send real-time notification
    if (req.io) {
      req.io.to(req.user._id.toString()).emit('notification', {
        type: 'lecture_created',
        message: `New lecture "${lecture.title}" added to ${subject.name}`,
        data: { 
          lectureId: lecture._id, 
          lectureTitle: lecture.title,
          subjectName: subject.name,
          status: lecture.status
        }
      });

      // Send attendance update
      req.io.to(req.user._id.toString()).emit('attendance_updated', {
        subjectId: subject._id,
        attendancePercentage: subject.attendancePercentage
      });
    }

    res.status(201).json({
      success: true,
      message: 'Lecture created successfully',
      data: lecture
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update lecture
// @route   PUT /api/lectures/:id
// @access  Private
router.put('/:id', validate(lectureSchemas.update), async (req, res, next) => {
  try {
    let lecture = await Lecture.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    const previousStatus = lecture.status;
    const subjectId = lecture.subjectId; // Store subjectId before update

    lecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('subjectId', 'name code color');

    // Update subject statistics if status changed
    if (req.body.status && previousStatus !== req.body.status) {
      try {
        await Subject.updateSubjectStats(subjectId);
        
        // Refresh subject data to get updated stats
        const updatedSubject = await Subject.findById(subjectId);
        
        // Send real-time notification if status changed
        if (req.io) {
          const statusMessages = {
            present: 'marked as Present',
            absent: 'marked as Absent', 
            late: 'marked as Late',
            excused: 'marked as Excused'
          };

          req.io.to(req.user._id.toString()).emit('notification', {
            type: 'lecture_updated',
            message: `Attendance ${statusMessages[req.body.status]}`,
            data: { 
              lectureId: lecture._id,
              subjectName: lecture.subjectId?.name || 'Subject',
              status: lecture.status
            }
          });

          // Send attendance update with latest stats
          if (updatedSubject) {
            req.io.to(req.user._id.toString()).emit('attendance_updated', {
              subjectId: subjectId,
              attendancePercentage: updatedSubject.attendancePercentage
            });
          }
        }
      } catch (statsError) {
        console.error('Error updating subject stats:', statsError);
        // Continue anyway - the lecture was updated successfully
      }
    }

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: lecture
    });
  } catch (error) {
    console.error('Error updating lecture:', error);
    next(error);
  }
});

// @desc    Delete lecture
// @route   DELETE /api/lectures/:id
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const lecture = await Lecture.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('subjectId', 'name');

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    const subjectId = lecture.subjectId._id;
    await Lecture.findByIdAndDelete(req.params.id);

    // Update subject statistics after deletion
    await Subject.updateSubjectStats(subjectId);

    // Send real-time notification
    if (req.io) {
      req.io.to(req.user._id.toString()).emit('notification', {
        type: 'lecture_deleted',
        message: `Lecture "${lecture.title}" deleted from ${lecture.subjectId.name}`,
        data: { 
          lectureId: lecture._id,
          subjectId: lecture.subjectId._id
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get lectures by date range
// @route   GET /api/lectures/range
// @access  Private
router.get('/range/:startDate/:endDate', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.params;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const lectures = await Lecture.find({
      userId: req.user._id,
      date: {
        $gte: start,
        $lte: end
      }
    })
    .sort({ date: 1 })
    .populate('subjectId', 'name code color')
    .lean();

    // Group lectures by date
    const groupedLectures = lectures.reduce((acc, lecture) => {
      const dateKey = lecture.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(lecture);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: groupedLectures
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get today's lectures
// @route   GET /api/lectures/today
// @access  Private
router.get('/today/list', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lectures = await Lecture.find({
      userId: req.user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .sort({ startTime: 1 })
    .populate('subjectId', 'name code color')
    .lean();

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get upcoming lectures
// @route   GET /api/lectures/upcoming
// @access  Private
router.get('/upcoming/list', async (req, res, next) => {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const lectures = await Lecture.find({
      userId: req.user._id,
      date: {
        $gte: now,
        $lte: nextWeek
      }
    })
    .sort({ date: 1, startTime: 1 })
    .limit(10)
    .populate('subjectId', 'name code color')
    .lean();

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk update lecture attendance
// @route   PUT /api/lectures/bulk-attendance
// @access  Private
router.put('/bulk-attendance', async (req, res, next) => {
  try {
    const { lectures } = req.body;

    if (!Array.isArray(lectures) || lectures.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lectures array is required'
      });
    }

    const updatePromises = lectures.map(async (lectureData) => {
      const { _id, status } = lectureData;
      
      if (!['present', 'absent', 'late', 'excused'].includes(status)) {
        return null;
      }
      
      return Lecture.findOneAndUpdate(
        { _id, userId: req.user._id },
        { status },
        { new: true }
      ).populate('subjectId', 'name code');
    });

    const updatedLectures = await Promise.all(updatePromises);
    const validUpdates = updatedLectures.filter(Boolean);

    // Send real-time notification
    if (req.io && validUpdates.length > 0) {
      req.io.to(req.user._id.toString()).emit('notification', {
        type: 'bulk_attendance_updated',
        message: `Updated attendance for ${validUpdates.length} lectures`,
        data: { count: validUpdates.length }
      });
    }

    res.status(200).json({
      success: true,
      message: `${validUpdates.length} lectures updated successfully`,
      data: validUpdates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get lecture statistics
// @route   GET /api/lectures/stats
// @access  Private
router.get('/stats/overview', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = { userId: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Get attendance statistics
    const attendanceStats = await Lecture.getAttendanceStats(
      req.user._id,
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
      endDate || new Date()
    );

    // Get weekly trend
    const weeklyTrend = await Lecture.getWeeklyTrend(req.user._id, 8); // Last 8 weeks

    // Get subject-wise attendance
    const subjectWiseAttendance = await Lecture.getSubjectWiseAttendance(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        overview: attendanceStats,
        weeklyTrend,
        subjectWiseAttendance
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark attendance for multiple lectures
// @route   POST /api/lectures/mark-attendance
// @access  Private
router.post('/mark-attendance', async (req, res, next) => {
  try {
    const { date, attendanceData } = req.body;

    if (!date || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: 'Date and attendance data are required'
      });
    }

    const lectureDate = new Date(date);
    const results = [];

    for (const { subjectId, status } of attendanceData) {
      // Check if lecture already exists for this date and subject
      let lecture = await Lecture.findOne({
        userId: req.user._id,
        subjectId,
        date: lectureDate
      });

      if (lecture) {
        // Update existing lecture
        lecture.status = status;
        await lecture.save();
      } else {
        // Create new lecture
        const subject = await Subject.findById(subjectId);
        if (subject) {
          lecture = await Lecture.create({
            title: `${subject.name} - ${lectureDate.toLocaleDateString()}`,
            topic: 'Regular class',
            date: lectureDate,
            startTime: '09:00',
            endTime: '10:00',
            status,
            subjectId,
            userId: req.user._id
          });
        }
      }

      if (lecture) {
        await lecture.populate('subjectId', 'name code color');
        results.push(lecture);
      }
    }

    // Send real-time notification
    if (req.io && results.length > 0) {
      req.io.to(req.user._id.toString()).emit('notification', {
        type: 'attendance_marked',
        message: `Attendance marked for ${results.length} subjects on ${lectureDate.toLocaleDateString()}`,
        data: { count: results.length, date: lectureDate }
      });
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked for ${results.length} lectures`,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;