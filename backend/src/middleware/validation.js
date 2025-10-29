const Joi = require('joi');

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .trim()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim(),
    password: Joi.string()
      .required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).trim(),
    profile: Joi.object({
      bio: Joi.string().max(500).allow(''),
      phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/).allow(''),
      university: Joi.string().max(100).allow(''),
      department: Joi.string().max(100).allow(''),
      year: Joi.number().integer().min(1).max(6)
    }),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'system'),
      language: Joi.string().min(2).max(5),
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        reminders: Joi.boolean()
      })
    }),
    attendanceGoal: Joi.number().min(0).max(100)
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(6)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  })
};

// Subject validation schemas
const subjectSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .trim(),
    code: Joi.string()
      .min(2)
      .max(20)
      .allow('')
      .trim()
      .uppercase(),
    description: Joi.string()
      .max(500)
      .allow('')
      .trim(),
    instructor: Joi.object({
      name: Joi.string().max(100).allow('').trim(),
      email: Joi.string().email().allow('')
    }),
    schedule: Joi.array().items(
      Joi.object({
        day: Joi.string()
          .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
          .required(),
        startTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required(),
        endTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required(),
        room: Joi.string().allow('').trim()
      })
    ),
    semester: Joi.string().allow('').trim(),
    year: Joi.number().integer().min(2020).max(2030),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/)
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    code: Joi.string().min(2).max(20).trim().uppercase(),
    description: Joi.string().max(500).allow('').trim(),
    instructor: Joi.object({
      name: Joi.string().max(100).allow('').trim(),
      email: Joi.string().email().allow('')
    }),
    schedule: Joi.array().items(
      Joi.object({
        day: Joi.string()
          .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
          .required(),
        startTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required(),
        endTime: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required(),
        room: Joi.string().allow('').trim()
      })
    ),
    semester: Joi.string().allow('').trim(),
    year: Joi.number().integer().min(2020).max(2030),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
    isActive: Joi.boolean()
  })
};

// Lecture validation schemas
const lectureSchemas = {
  create: Joi.object({
    title: Joi.string()
      .min(2)
      .max(200)
      .required()
      .trim(),
    topic: Joi.string()
      .min(2)
      .max(300)
      .required()
      .trim(),
    description: Joi.string()
      .max(1000)
      .allow('')
      .trim(),
    date: Joi.date()
      .max('now')
      .required()
      .messages({
        'date.max': 'Cannot mark attendance for future dates'
      }),
    startTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    endTime: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    room: Joi.string()
      .max(50)
      .allow('')
      .trim(),
    status: Joi.string()
      .valid('present', 'absent', 'late', 'excused')
      .allow('')
      .optional(),
    notes: Joi.string()
      .max(1000)
      .allow('')
      .trim(),
    materials: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        url: Joi.string().uri().allow(''),
        type: Joi.string().valid('pdf', 'doc', 'ppt', 'video', 'audio', 'link', 'other')
      })
    ),
    assignments: Joi.array().items(
      Joi.object({
        title: Joi.string().required().trim(),
        description: Joi.string().allow('').trim(),
        dueDate: Joi.date(),
        status: Joi.string().valid('pending', 'completed', 'submitted', 'graded'),
        marks: Joi.object({
          obtained: Joi.number().min(0),
          total: Joi.number().min(0)
        })
      })
    ),
    isImportant: Joi.boolean(),
    isExam: Joi.boolean(),
    examType: Joi.string().valid('quiz', 'midterm', 'final', 'assignment', 'presentation', 'other'),
    subjectId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
  }),

  update: Joi.object({
    title: Joi.string().min(2).max(200).trim(),
    topic: Joi.string().min(2).max(300).trim(),
    description: Joi.string().max(1000).allow('').trim(),
    date: Joi.date(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    room: Joi.string().max(50).allow('').trim(),
    status: Joi.string().valid('present', 'absent', 'late', 'excused'),
    notes: Joi.string().max(1000).allow('').trim(),
    materials: Joi.array().items(
      Joi.object({
        name: Joi.string().required().trim(),
        url: Joi.string().uri().allow(''),
        type: Joi.string().valid('pdf', 'doc', 'ppt', 'video', 'audio', 'link', 'other')
      })
    ),
    assignments: Joi.array().items(
      Joi.object({
        title: Joi.string().required().trim(),
        description: Joi.string().allow('').trim(),
        dueDate: Joi.date(),
        status: Joi.string().valid('pending', 'completed', 'submitted', 'graded'),
        marks: Joi.object({
          obtained: Joi.number().min(0),
          total: Joi.number().min(0)
        })
      })
    ),
    isImportant: Joi.boolean(),
    isExam: Joi.boolean(),
    examType: Joi.string().valid('quiz', 'midterm', 'final', 'assignment', 'presentation', 'other')
  })
};

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors
      });
    }

    req.query = value;
    next();
  };
};

// Common query schemas
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string(),
    fields: Joi.string(),
    search: Joi.string().trim()
  }),

  dateRange: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

module.exports = {
  validate,
  validateQuery,
  userSchemas,
  subjectSchemas,
  lectureSchemas,
  querySchemas
};