const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lecture title is required'],
    trim: true,
    maxlength: [200, 'Lecture title cannot exceed 200 characters']
  },
  topic: {
    type: String,
    required: [true, 'Lecture topic is required'],
    trim: true,
    maxlength: [300, 'Lecture topic cannot exceed 300 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Lecture date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  duration: {
    type: Number, // in minutes
    min: 15,
    max: 300
  },
  room: {
    type: String,
    trim: true,
    maxlength: [50, 'Room cannot exceed 50 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['present', 'absent', 'late', 'excused'],
      message: 'Status must be present, absent, late, or excused'
    },
    default: 'absent' // Default to absent if not specified
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  materials: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['pdf', 'doc', 'ppt', 'video', 'audio', 'link', 'other'],
      default: 'other'
    }
  }],
  assignments: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    dueDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'submitted', 'graded'],
      default: 'pending'
    },
    marks: {
      obtained: Number,
      total: Number
    }
  }],
  isImportant: {
    type: Boolean,
    default: false
  },
  isExam: {
    type: Boolean,
    default: false
  },
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'presentation', 'other']
  },
  subjectId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject ID is required']
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
lectureSchema.index({ userId: 1, date: -1 });
lectureSchema.index({ subjectId: 1, date: -1 });
lectureSchema.index({ status: 1 });
lectureSchema.index({ date: 1 });
lectureSchema.index({ createdAt: -1 });

// Compound index for efficient queries
lectureSchema.index({ userId: 1, subjectId: 1, date: -1 });

// Virtual for formatted date
lectureSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for attendance status color
lectureSchema.virtual('statusColor').get(function() {
  const colors = {
    present: '#22c55e',
    absent: '#ef4444',
    late: '#f59e0b',
    excused: '#6366f1'
  };
  return colors[this.status] || '#64748b';
});

// Pre-save middleware to calculate duration
lectureSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01T${this.startTime}:00`);
    const end = new Date(`2000-01-01T${this.endTime}:00`);
    this.duration = Math.max(0, (end - start) / (1000 * 60)); // Convert to minutes
  }
  next();
});

// Post-save middleware to update subject statistics
lectureSchema.post('save', async function() {
  try {
    const Subject = mongoose.model('Subject');
    await Subject.updateSubjectStats(this.subjectId);
  } catch (error) {
    console.error('Error updating subject stats:', error);
  }
});

// Post-remove middleware to update subject statistics
lectureSchema.post('deleteOne', { document: true, query: false }, async function() {
  try {
    const Subject = mongoose.model('Subject');
    await Subject.updateSubjectStats(this.subjectId);
  } catch (error) {
    console.error('Error updating subject stats:', error);
  }
});

// Static method to get attendance statistics for a date range
lectureSchema.statics.getAttendanceStats = async function(userId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  result.attendanceRate = result.total > 0 
    ? Math.round(((result.present + result.late + result.excused) / result.total) * 100)
    : 0;
  
  return result;
};

// Static method to get weekly attendance trend
lectureSchema.statics.getWeeklyTrend = async function(userId, weeks = 4) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (weeks * 7));
  
  const trend = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          week: { $week: '$date' }
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
        week: '$_id.week',
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
      $sort: { year: 1, week: 1 }
    }
  ]);
  
  return trend;
};

// Static method to get subject-wise attendance
lectureSchema.statics.getSubjectWiseAttendance = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'subjectId',
        foreignField: '_id',
        as: 'subject'
      }
    },
    {
      $unwind: '$subject'
    },
    {
      $group: {
        _id: '$subjectId',
        subjectName: { $first: '$subject.name' },
        subjectCode: { $first: '$subject.code' },
        subjectColor: { $first: '$subject.color' },
        total: { $sum: 1 },
        present: {
          $sum: {
            $cond: [
              { $in: ['$status', ['present', 'late', 'excused']] },
              1,
              0
            ]
          }
        },
        absent: {
          $sum: {
            $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        subjectName: 1,
        subjectCode: 1,
        subjectColor: 1,
        total: 1,
        present: 1,
        absent: 1,
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
      $sort: { percentage: -1 }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('Lecture', lectureSchema);