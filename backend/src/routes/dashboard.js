const express = require('express');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Lecture = require('../models/Lecture');

const router = express.Router();

// @desc    Get database debug info
// @route   GET /api/dashboard/debug
// @access  Private
router.get('/debug', async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const subjects = await Subject.find({ userId }).lean();
    const lectures = await Lecture.find({ userId }).lean();
    
    res.json({
      success: true,
      debug: {
        userId,
        subjectsCount: subjects.length,
        lecturesCount: lectures.length,
        subjects: subjects.map(s => ({
          id: s._id,
          name: s.name,
          totalLectures: s.totalLectures,
          attendedLectures: s.attendedLectures,
          attendancePercentage: s.attendancePercentage
        })),
        lectures: lectures.map(l => ({
          id: l._id,
          subjectId: l.subjectId,
          status: l.status,
          date: l.date
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Initialize test data for demo
// @route   POST /api/dashboard/init-demo-data
// @access  Private
router.post('/init-demo-data', async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Check if user already has subjects
    const existingSubjects = await Subject.find({ userId });
    if (existingSubjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Demo data already exists. Delete existing subjects first.'
      });
    }
    
    // Create demo subjects
    const subjects = await Subject.create([
      {
        userId,
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Advanced Mathematics',
        isActive: true
      },
      {
        userId,
        name: 'Computer Science',
        code: 'CS101',
        description: 'Introduction to Computer Science',
        isActive: true
      }
    ]);
    
    // Create demo lectures
    const lectures = [];
    for (let subject of subjects) {
      // Create 10 lectures for each subject with mixed attendance
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        lectures.push({
          userId,
          subjectId: subject._id,
          title: `${subject.name} - Lecture ${i + 1}`,
          topic: `Topic ${i + 1}`,
          date: date,
          startTime: '09:00',
          endTime: '10:00',
          status: Math.random() > 0.3 ? 'present' : 'absent' // 70% attendance rate
        });
      }
    }
    
    await Lecture.insertMany(lectures);
    
    // Update subject statistics
    for (let subject of subjects) {
      await Subject.updateSubjectStats(subject._id);
    }
    
    res.status(201).json({
      success: true,
      message: 'Demo data created successfully!',
      data: {
        subjects: subjects.length,
        lectures: lectures.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get dashboard overview
// @route   GET /api/dashboard
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    
    // Get user's subjects and update their stats
    const userSubjects = await Subject.find({ userId: userId, isActive: true });
    
    // Update attendance stats for each subject
    for (let subject of userSubjects) {
      await Subject.updateSubjectStats(subject._id);
    }
    
    // Fetch updated subjects
    const updatedSubjects = await Subject.find({ userId: userId, isActive: true });
    
    // Calculate overall attendance from all lectures across all subjects
    const allLectures = await Lecture.find({ userId: userId });
    const totalLecturesCount = allLectures.length;
    const attendedLecturesCount = allLectures.filter(l => l.status === 'present').length;
    const overallAttendancePercentage = totalLecturesCount > 0 
      ? Math.round((attendedLecturesCount / totalLecturesCount) * 100) 
      : 0;
    
    const subjectStats = {
      totalSubjects: updatedSubjects.length,
      totalLectures: totalLecturesCount,
      totalAttended: attendedLecturesCount,
      averageAttendance: overallAttendancePercentage
    };
    
    // Debug logging
    console.log('Dashboard Debug:', {
      userId,
      totalSubjects: updatedSubjects.length,
      totalLecturesAcrossAllSubjects: totalLecturesCount,
      attendedLecturesAcrossAllSubjects: attendedLecturesCount,
      overallAttendancePercentage,
      subjectData: updatedSubjects.map(s => ({
        name: s.name,
        totalLectures: s.totalLectures,
        attendedLectures: s.attendedLectures,
        attendancePercentage: s.attendancePercentage
      })),
      calculatedStats: subjectStats
    });
    
    // Get attendance statistics for different periods
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    // Simplified stats for now to avoid ObjectId issues
    const userLectures = await Lecture.find({ userId: userId });
    const totalLectures = userLectures.length;
    const attendedLectures = userLectures.filter(l => l.status === 'present').length;
    const attendancePercentage = totalLectures > 0 ? (attendedLectures / totalLectures) * 100 : 0;
    
    const monthlyStats = { attendancePercentage, totalLectures, attendedLectures };
    const weeklyStats = { attendancePercentage, totalLectures, attendedLectures };  
    const overallStats = { attendancePercentage, totalLectures, attendedLectures };
    
    // Get recent lectures
    const recentLectures = await Lecture.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .populate('subjectId', 'name code color')
      .lean();
    
    // Get today's lectures
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysLectures = await Lecture.find({
      userId: userId,
      date: { $gte: today, $lt: tomorrow }
    })
    .sort({ startTime: 1 })
    .populate('subjectId', 'name code color')
    .lean();
    
    // Get upcoming lectures (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingLectures = await Lecture.find({
      userId: userId,
      date: { $gt: new Date(), $lte: nextWeek }
    })
    .sort({ date: 1, startTime: 1 })
    .limit(10)
    .populate('subjectId', 'name code color')
    .lean();
    
    // Get subjects with low attendance (below user's goal)
    const lowAttendanceSubjects = await Subject.find({
      userId: userId,
      isActive: true,
      attendancePercentage: { $lt: req.user.attendanceGoal }
    })
    .sort({ attendancePercentage: 1 })
    .limit(3)
    .lean();
    
    // Simplified attendance data for now
    const attendanceTrend = [];
    const subjectWiseAttendance = [];
    
    // Calculate streak (consecutive days with lectures attended)
    const streakData = await calculateAttendanceStreak(userId);
    
    // Simplified monthly comparison for now
    const monthlyComparison = {
      current: { attendancePercentage: 0, totalLectures: 0 },
      previous: { attendancePercentage: 0, totalLectures: 0 },
      trend: 'stable'
    };
    
    const dashboardData = {
      user: {
        name: req.user.name,
        attendanceGoal: req.user.attendanceGoal,
        totalSubjects: subjectStats.totalSubjects,
        joinDate: req.user.createdAt
      },
      overview: {
        totalSubjects: subjectStats.totalSubjects,
        totalLectures: subjectStats.totalLectures,
        totalAttended: subjectStats.totalAttended,
        averageAttendance: subjectStats.averageAttendance,
        attendanceGoal: req.user.attendanceGoal,
        meetsGoal: subjectStats.averageAttendance >= req.user.attendanceGoal
      },
      periods: {
        overall: overallStats,
        monthly: monthlyStats,
        weekly: weeklyStats
      },
      lectures: {
        today: todaysLectures,
        upcoming: upcomingLectures,
        recent: recentLectures
      },
      subjects: {
        all: subjectWiseAttendance,
        lowAttendance: lowAttendanceSubjects
      },
      trends: {
        weekly: attendanceTrend,
        monthly: monthlyComparison
      },
      streak: streakData,
      insights: generateInsights(subjectStats, overallStats, req.user.attendanceGoal)
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get attendance summary
// @route   GET /api/dashboard/attendance-summary
// @access  Private
router.get('/attendance-summary', async (req, res, next) => {
  try {
    const { period = 'month', subjectId } = req.query;
    const userId = req.user._id;
    
    let startDate, endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'semester':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const filter = { userId, date: { $gte: startDate, $lte: endDate } };
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    
    const attendanceSummary = await Lecture.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: attendanceSummary
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get performance analytics
// @route   GET /api/dashboard/analytics
// @access  Private
router.get('/analytics', async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Get performance by day of week
    const dayWisePerformance = await Lecture.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $in: ['$status', ['present', 'late', 'excused']] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          day: '$_id',
          total: 1,
          present: 1,
          percentage: { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
        }
      },
      { $sort: { day: 1 } }
    ]);
    
    // Get performance by time of day
    const timeWisePerformance = await Lecture.aggregate([
      { $match: { userId } },
      {
        $addFields: {
          hour: { $toInt: { $substr: ['$startTime', 0, 2] } }
        }
      },
      {
        $group: {
          _id: '$hour',
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $in: ['$status', ['present', 'late', 'excused']] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          hour: '$_id',
          total: 1,
          present: 1,
          percentage: { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
        }
      },
      { $sort: { hour: 1 } }
    ]);
    
    // Get improvement suggestions
    const suggestions = await generateImprovementSuggestions(userId, req.user.attendanceGoal);
    
    res.status(200).json({
      success: true,
      data: {
        dayWisePerformance,
        timeWisePerformance,
        suggestions
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate attendance streak
async function calculateAttendanceStreak(userId) {
  const lectures = await Lecture.find({ userId })
    .sort({ date: -1 })
    .select('date status')
    .lean();
  
  let currentStreak = 0;
  let maxStreak = 0;
  let streakDates = [];
  
  const groupedByDate = lectures.reduce((acc, lecture) => {
    const dateKey = lecture.date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(lecture);
    return acc;
  }, {});
  
  const sortedDates = Object.keys(groupedByDate).sort().reverse();
  
  for (const date of sortedDates) {
    const dayLectures = groupedByDate[date];
    const hasAttended = dayLectures.some(lecture => 
      ['present', 'late', 'excused'].includes(lecture.status)
    );
    
    if (hasAttended) {
      currentStreak++;
      streakDates.push(date);
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      break;
    }
  }
  
  return {
    current: currentStreak,
    maximum: maxStreak,
    dates: streakDates.slice(0, 7) // Last 7 days of streak
  };
}

// Helper function to get monthly comparison (disabled for now due to ObjectId issues)
// async function getMonthlyComparison(userId) {
//   const currentDate = new Date();
//   const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//   const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
//   const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
//   
//   const [currentMonth, lastMonth] = await Promise.all([
//     Lecture.getAttendanceStats(userId, currentMonthStart, currentDate),
//     Lecture.getAttendanceStats(userId, lastMonthStart, lastMonthEnd)
//   ]);
//   
//   return {
//     current: currentMonth,
//     previous: lastMonth,
//     improvement: currentMonth.attendanceRate - lastMonth.attendanceRate
//   };
// }

// Helper function to generate insights
function generateInsights(subjectStats, overallStats, attendanceGoal) {
  const insights = [];
  
  if (overallStats.attendanceRate >= attendanceGoal) {
    insights.push({
      type: 'positive',
      message: `Great job! You're meeting your attendance goal of ${attendanceGoal}%`,
      icon: 'trophy'
    });
  } else {
    const deficit = attendanceGoal - overallStats.attendanceRate;
    insights.push({
      type: 'warning',
      message: `You need to improve by ${deficit.toFixed(1)}% to meet your goal`,
      icon: 'target'
    });
  }
  
  if (subjectStats.totalSubjects > 0) {
    insights.push({
      type: 'info',
      message: `You're tracking ${subjectStats.totalSubjects} subjects with ${subjectStats.totalLectures} total lectures`,
      icon: 'book'
    });
  }
  
  if (overallStats.total > 0) {
    const presentPercentage = (overallStats.present / overallStats.total) * 100;
    if (presentPercentage > 90) {
      insights.push({
        type: 'positive',
        message: 'Excellent attendance record! Keep it up!',
        icon: 'star'
      });
    }
  }
  
  return insights;
}

// Helper function to generate improvement suggestions
async function generateImprovementSuggestions(userId, attendanceGoal = 75) {
  const suggestions = [];
  
  // Get subjects with low attendance
  const lowAttendanceSubjects = await Subject.find({
    userId: userId.toString(),
    isActive: true,
    attendancePercentage: { $lt: attendanceGoal }
  }).limit(3);
  
  if (lowAttendanceSubjects.length > 0) {
    suggestions.push({
      type: 'improvement',
      title: 'Focus on Low Attendance Subjects',
      message: `Prioritize attending ${lowAttendanceSubjects.map(s => s.name).join(', ')}`,
      action: 'view_subjects'
    });
  }
  
  // Check for missed lectures in the last week
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const missedLectures = await Lecture.countDocuments({
    userId: userId.toString(),
    status: 'absent',
    date: { $gte: lastWeek }
  });
  
  if (missedLectures > 3) {
    suggestions.push({
      type: 'warning',
      title: 'High Absence Rate',
      message: `You missed ${missedLectures} lectures last week. Consider setting reminders`,
      action: 'set_reminders'
    });
  }
  
  return suggestions;
}

module.exports = router;