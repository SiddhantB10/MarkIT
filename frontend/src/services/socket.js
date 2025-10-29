import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventListeners = new Map();
  }

  // Connect to socket server
  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    const socketURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketURL, {
      auth: {
        token: token || localStorage.getItem('token') || Cookies.get('token'),
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  // Setup default event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Show connection toast only after reconnection
      if (this.reconnectAttempts > 0) {
        toast.success('Reconnected to server');
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      
      if (reason !== 'io client disconnect') {
        toast.error('Connection lost. Attempting to reconnect...');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Failed to connect to server. Please refresh the page.');
      }
    });

    // Welcome message
    this.socket.on('connected', (data) => {
      // Successfully connected to server
    });

    // Notification handlers
    this.socket.on('notification', (notification) => {
      this.handleNotification(notification);
    });

    // Attendance updates
    this.socket.on('attendance_updated', (data) => {
      this.emit('attendanceUpdate', data);
    });

    // Lecture notifications
    this.socket.on('lecture_notification', (notification) => {
      this.handleLectureNotification(notification);
    });

    // Subject notifications
    this.socket.on('subject_notification', (notification) => {
      this.handleSubjectNotification(notification);
    });

    // Achievement notifications
    this.socket.on('achievement', (achievement) => {
      this.handleAchievement(achievement);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Real-time connection error');
    });

    // Ping/pong for connection health
    this.socket.on('pong', (data) => {
      // Connection healthy
    });
  }

  // Handle general notifications
  handleNotification(notification) {
    const { type, message, data } = notification;
    
    switch (type) {
      case 'welcome':
      case 'login':
        toast.success(message);
        break;
      case 'lecture_created':
      case 'subject_created':
        toast.success(message, {
          icon: '📚',
          duration: 3000,
        });
        break;
      case 'lecture_updated':
      case 'subject_updated':
        toast.success(message, {
          icon: '✏️',
          duration: 3000,
        });
        break;
      case 'lecture_deleted':
      case 'subject_deleted':
        toast.success(message, {
          icon: '🗑️',
          duration: 3000,
        });
        break;
      case 'attendance_marked':
        toast.success(message, {
          icon: '✅',
          duration: 3000,
        });
        break;
      case 'bulk_attendance_updated':
        toast.success(message, {
          icon: '📊',
          duration: 3000,
        });
        break;
      default:
        toast(message);
    }

    // Emit to any registered listeners
    this.emit('notification', notification);
  }

  // Handle lecture-specific notifications
  handleLectureNotification(notification) {
    const { type, message } = notification;
    
    toast(message, {
      icon: type === 'lecture_created' ? '📝' : '📚',
      duration: 4000,
    });

    this.emit('lectureNotification', notification);
  }

  // Handle subject-specific notifications
  handleSubjectNotification(notification) {
    const { type, message } = notification;
    
    toast(message, {
      icon: type === 'subject_updated' ? '✏️' : '📖',
      duration: 4000,
    });

    this.emit('subjectNotification', notification);
  }

  // Handle achievement notifications
  handleAchievement(achievement) {
    const { type, message } = achievement;
    
    toast.success(message, {
      icon: '🏆',
      duration: 6000,
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      },
    });

    this.emit('achievement', achievement);
  }

  // Join a room
  joinRoom(roomId) {
    if (this.socket?.connected) {
      this.socket.emit('join_room', roomId);
    }
  }

  // Leave a room
  leaveRoom(roomId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_room', roomId);
    }
  }

  // Send attendance update
  sendAttendanceUpdate(data) {
    if (this.socket?.connected) {
      this.socket.emit('attendance_update', data);
    }
  }

  // Send lecture created event
  sendLectureCreated(lectureData) {
    if (this.socket?.connected) {
      this.socket.emit('lecture_created', lectureData);
    }
  }

  // Send subject updated event
  sendSubjectUpdated(subjectData) {
    if (this.socket?.connected) {
      this.socket.emit('subject_updated', subjectData);
    }
  }

  // Set reminder
  setReminder(reminderData) {
    if (this.socket?.connected) {
      this.socket.emit('set_reminder', reminderData);
    }
  }

  // Update status
  updateStatus(status) {
    if (this.socket?.connected) {
      this.socket.emit('update_status', status);
    }
  }

  // Ping server
  ping() {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  // Generic event listener registration
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);

    // Also listen on socket if it exists
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit event to registered listeners
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;