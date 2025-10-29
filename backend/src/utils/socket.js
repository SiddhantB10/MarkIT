const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    // User connected
    
    // Join user to their personal room
    socket.join(socket.userId);
    
    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to MarkIt real-time server',
      userId: socket.userId,
      timestamp: new Date()
    });
    
    // Handle user joining rooms
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user_joined', {
        userId: socket.userId,
        userName: socket.user.name,
        timestamp: new Date()
      });
    });
    
    // Handle leaving rooms
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        userName: socket.user.name,
        timestamp: new Date()
      });
    });
    
    // Handle attendance updates
    socket.on('attendance_update', (data) => {
      // Broadcast to user's room
      socket.to(socket.userId).emit('attendance_updated', {
        ...data,
        userId: socket.userId,
        timestamp: new Date()
      });
    });
    
    // Handle lecture creation
    socket.on('lecture_created', (data) => {
      socket.to(socket.userId).emit('lecture_notification', {
        type: 'lecture_created',
        message: `New lecture "${data.title}" has been added`,
        data,
        timestamp: new Date()
      });
    });
    
    // Handle subject updates
    socket.on('subject_updated', (data) => {
      socket.to(socket.userId).emit('subject_notification', {
        type: 'subject_updated',
        message: `Subject "${data.name}" has been updated`,
        data,
        timestamp: new Date()
      });
    });
    
    // Handle goal achievement
    socket.on('goal_achieved', (data) => {
      socket.emit('achievement', {
        type: 'goal_achieved',
        message: `Congratulations! You've achieved ${data.goal}% attendance`,
        data,
        timestamp: new Date()
      });
    });
    
    // Handle reminder notifications
    socket.on('set_reminder', (data) => {
      // In production, you would integrate with a job scheduler
      const { lectureId, reminderTime } = data;
      
      socket.emit('reminder_set', {
        message: 'Reminder set successfully',
        lectureId,
        reminderTime,
        timestamp: new Date()
      });
    });
    
    // Handle typing indicators (for future chat features)
    socket.on('typing_start', (data) => {
      socket.to(data.roomId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        timestamp: new Date()
      });
    });
    
    socket.on('typing_stop', (data) => {
      socket.to(data.roomId).emit('user_stopped_typing', {
        userId: socket.userId,
        timestamp: new Date()
      });
    });
    
    // Handle status updates
    socket.on('update_status', (status) => {
      socket.user.status = status;
      socket.broadcast.emit('user_status_updated', {
        userId: socket.userId,
        userName: socket.user.name,
        status,
        timestamp: new Date()
      });
    });
    
    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() });
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      // User disconnected
      
      // Broadcast to all rooms the user was in
      socket.broadcast.emit('user_disconnected', {
        userId: socket.userId,
        userName: socket.user.name,
        reason,
        timestamp: new Date()
      });
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      socket.emit('error', {
        message: 'An error occurred',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        timestamp: new Date()
      });
    });
  });
  
  // Handle global events
  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err.req);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('Error context:', err.context);
  });
  
  // Periodic cleanup of inactive connections
  setInterval(() => {
    const activeConnections = io.sockets.sockets.size;
    // Track active connections (logged every 5 minutes)
  }, 300000); // Every 5 minutes
  
  return io;
};

// Helper functions for broadcasting notifications
const broadcastToUser = (io, userId, event, data) => {
  io.to(userId).emit(event, {
    ...data,
    timestamp: new Date()
  });
};

const broadcastToAll = (io, event, data) => {
  io.emit(event, {
    ...data,
    timestamp: new Date()
  });
};

// Notification types
const NOTIFICATION_TYPES = {
  LECTURE_CREATED: 'lecture_created',
  LECTURE_UPDATED: 'lecture_updated', 
  LECTURE_DELETED: 'lecture_deleted',
  SUBJECT_CREATED: 'subject_created',
  SUBJECT_UPDATED: 'subject_updated',
  SUBJECT_DELETED: 'subject_deleted',
  ATTENDANCE_UPDATED: 'attendance_updated',
  GOAL_ACHIEVED: 'goal_achieved',
  REMINDER: 'reminder',
  WELCOME: 'welcome',
  ERROR: 'error'
};

module.exports = socketHandler;
module.exports.broadcastToUser = broadcastToUser;
module.exports.broadcastToAll = broadcastToAll;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;