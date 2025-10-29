const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const subjectRoutes = require('./routes/subjects');
const lectureRoutes = require('./routes/lectures');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { auth: authMiddleware } = require('./middleware/auth');

// Import socket handlers
const socketHandler = require('./utils/socket');

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:5173", // Vite dev server
      "http://localhost:5174", // Vite dev server (alternate port)
      "http://localhost:3000"  // Production frontend
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization"]
  },
  transports: ['websocket', 'polling']
});

// Socket.IO connection handling
socketHandler(io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Auth rate limiting - more permissive for development
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 auth requests per 5 minutes (development-friendly)
  message: {
    error: 'Too many authentication attempts, please try again in a few minutes.'
  },
  skipSuccessfulRequests: true // Don't count successful logins
});

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL, // Vercel production URL
  "http://localhost:5173", // Vite dev server
  "http://localhost:5174", // Vite dev server (alternate port)
  "http://localhost:3000"  // Local dev
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, only allow specified origins
    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Additional explicit preflight handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/subjects', authMiddleware, subjectRoutes);
app.use('/api/lectures', authMiddleware, lectureRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Default route
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to MarkIt API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Start HTTP server with Socket.IO
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 Socket.IO server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Server startup error:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('👋 Server closed');
      process.exit(0);
    });
  });
});

startServer();

module.exports = app;
