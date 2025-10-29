const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Subject code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  instructor: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Instructor name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    }
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    room: {
      type: String,
      trim: true
    }
  }],
  semester: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 2020,
    max: 2030
  },
  color: {
    type: String,
    default: '#3b82f6',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  // Statistics (calculated fields)
  totalLectures: {
    type: Number,
    default: 0
  },
  attendedLectures: {
    type: Number,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
subjectSchema.index({ userId: 1 });
// Removed unique index on code since code is now optional
// subjectSchema.index({ code: 1, userId: 1 }, { unique: true });
subjectSchema.index({ createdAt: -1 });
subjectSchema.index({ isActive: 1 });

// Virtual for lectures
subjectSchema.virtual('lectures', {
  ref: 'Lecture',
  localField: '_id',
  foreignField: 'subjectId'
});

// Virtual for recent lectures
subjectSchema.virtual('recentLectures', {
  ref: 'Lecture',
  localField: '_id',
  foreignField: 'subjectId',
  options: { 
    sort: { date: -1 },
    limit: 5
  }
});

// Pre-save middleware to update attendance statistics
subjectSchema.pre('save', async function(next) {
  if (this.isNew) return next();
  
  try {
    const Lecture = mongoose.model('Lecture');
    const stats = await Lecture.aggregate([
      {
        $match: { subjectId: this._id }
      },
      {
        $group: {
          _id: null,
          totalLectures: { $sum: 1 },
          attendedLectures: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    if (stats.length > 0) {
      this.totalLectures = stats[0].totalLectures;
      this.attendedLectures = stats[0].attendedLectures;
      this.attendancePercentage = this.totalLectures > 0 
        ? Math.round((this.attendedLectures / this.totalLectures) * 100)
        : 0;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to update subject statistics
subjectSchema.statics.updateSubjectStats = async function(subjectId) {
  try {
    const Lecture = mongoose.model('Lecture');
    
    // Ensure subjectId is valid ObjectId
    let objectId;
    if (typeof subjectId === 'string') {
      objectId = new mongoose.Types.ObjectId(subjectId);
    } else if (subjectId instanceof mongoose.Types.ObjectId) {
      objectId = subjectId;
    } else if (subjectId && subjectId._id) {
      objectId = subjectId._id;
    } else {
      objectId = subjectId;
    }
    
    const stats = await Lecture.aggregate([
      {
        $match: { subjectId: objectId }
      },
      {
        $group: {
          _id: null,
          totalLectures: { $sum: 1 },
          attendedLectures: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    const { totalLectures = 0, attendedLectures = 0 } = stats[0] || {};
    const attendancePercentage = totalLectures > 0 
      ? Math.round((attendedLectures / totalLectures) * 100)
      : 0;
    
    await this.findByIdAndUpdate(objectId, {
      totalLectures,
      attendedLectures,
      attendancePercentage
    });
    
    return { totalLectures, attendedLectures, attendancePercentage };
  } catch (error) {
    console.error('Error in updateSubjectStats:', error);
    throw error;
  }
};

// Static method to get user's subject statistics
subjectSchema.statics.getUserSubjectStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalSubjects: { $sum: 1 },
        averageAttendance: { $avg: '$attendancePercentage' },
        totalLectures: { $sum: '$totalLectures' },
        totalAttended: { $sum: '$attendedLectures' }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalSubjects: 0,
    averageAttendance: 0,
    totalLectures: 0,
    totalAttended: 0
  };
  
  result.averageAttendance = Math.round(result.averageAttendance || 0);
  
  return result;
};

// Method to check if subject meets attendance goal
subjectSchema.methods.meetsAttendanceGoal = function(goal = 75) {
  return this.attendancePercentage >= goal;
};

module.exports = mongoose.model('Subject', subjectSchema);