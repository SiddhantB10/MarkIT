const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database (without populate for virtual fields)
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid - user not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired.'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Middleware to check if user owns the resource
const resourceOwner = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    // Skip check if user is admin
    if (req.user.role === 'admin') {
      return next();
    }

    // Get resource user ID from request body, params, or query
    let resourceUserId = req.body[resourceUserIdField] || 
                        req.params[resourceUserIdField] || 
                        req.query[resourceUserIdField];

    // If not found, try to get from the resource itself (for update/delete operations)
    if (!resourceUserId && req.resource) {
      resourceUserId = req.resource[resourceUserIdField];
    }

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource user ID not provided.'
      });
    }

    if (req.user._id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Optional auth middleware (doesn't require token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Continue without user if token is invalid
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue without user
  }
};

module.exports = {
  auth,
  adminAuth,
  resourceOwner,
  optionalAuth
};