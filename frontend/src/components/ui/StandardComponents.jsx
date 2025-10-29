// MarkIt UI Style System
// This file contains all the standardized UI components and styles

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

// Common animation variants
export const commonAnimations = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  },
  
  itemVariants: {
    hidden: { y: 30, opacity: 0, rotateX: -15 },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  },
  
  cardHoverVariants: {
    hover: {
      rotateY: 5,
      rotateX: 5,
      scale: 1.05,
      y: -10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  },

  buttonHoverVariants: {
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    tap: {
      scale: 0.95
    }
  }
};

// Standardized Glass Card Component
export const GlassCard = forwardRef(({ 
  children, 
  className = '', 
  variant = 'default',
  hoverable = true,
  gradient = '',
  ...props 
}, ref) => {
  const baseClasses = "glass border border-white/10 backdrop-blur-xl card-3d";
  const variantClasses = {
    default: "p-6 rounded-3xl",
    compact: "p-4 rounded-2xl",
    large: "p-8 rounded-3xl",
    stats: "p-6 rounded-3xl text-center"
  };
  
  const gradientClass = gradient ? `bg-gradient-to-br ${gradient}` : '';
  
  return (
    <motion.div
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${gradientClass} ${className}`}
      variants={hoverable ? commonAnimations.cardHoverVariants : undefined}
      whileHover={hoverable ? "hover" : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
});

// Standardized Button Component
export const StandardButton = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  gradient = '',
  ...props
}, ref) => {
  const baseClasses = "btn-modern font-semibold rounded-2xl border-2 transition-all duration-300";
  
  const variantClasses = {
    primary: "text-white border-white/20 shadow-lg",
    secondary: "text-gray-200 border-white/10 glass-dark",
    accent: "text-white border-white/30",
    danger: "text-white border-red-500/30 bg-gradient-to-r from-red-500/20 to-red-600/20"
  };
  
  const sizeClasses = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-10 py-4 text-lg"
  };
  
  const gradientStyle = gradient ? { background: gradient } : 
    variant === 'primary' ? { background: 'var(--gradient-primary)' } : {};

  return (
    <motion.button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={gradientStyle}
      variants={commonAnimations.buttonHoverVariants}
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {children}
    </motion.button>
  );
});

// Standardized Input Component
export const StandardInput = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-200">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 ${Icon ? 'pl-10' : ''} 
            bg-white/5 border border-white/20 rounded-xl 
            text-white placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
            backdrop-blur-sm transition-all duration-300
            ${error ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

// Standardized Page Header Component
export const PageHeader = ({ 
  title, 
  subtitle, 
  backButton = null,
  actions = null,
  className = '' 
}) => {
  return (
    <motion.div 
      variants={commonAnimations.itemVariants}
      className={`mb-8 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backButton}
          <div>
            <motion.h1 
              className="text-4xl font-bold text-white mb-2"
              whileHover={{
                scale: 1.02,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <p className="text-gray-300 text-lg">{subtitle}</p>
            )}
            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mt-3 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-4">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Standardized Back Button Component
export const BackButton = ({ onClick, to, label = "Back" }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {label}
    </motion.button>
  );
};

// Standardized Stats Card Component
export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  gradient = 'from-blue-500/20 to-purple-500/20',
  iconGradient = 'from-blue-500 to-purple-600'
}) => {
  return (
    <GlassCard 
      variant="stats" 
      gradient={gradient}
      className="group"
    >
      <div className="flex items-center justify-center mb-4">
        <div className={`w-16 h-16 bg-gradient-to-br ${iconGradient} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
          {Icon && <Icon className="w-8 h-8 text-white" />}
        </div>
      </div>
      <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
      <p className="text-lg font-semibold text-gray-200 mb-1">{title}</p>
      {subtitle && <p className="text-sm text-gray-300">{subtitle}</p>}
    </GlassCard>
  );
};

// Standardized Loading Spinner
export const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`spinner ${sizeClasses[size]} ${className}`}></div>
  );
};

// Standardized Modal Component
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className = '',
  size = 'medium'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`${sizeClasses[size]} w-full glass p-6 rounded-3xl border border-white/20 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

// Standardized Alert Component
export const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  className = '',
  dismissible = false,
  onDismiss 
}) => {
  const typeClasses = {
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
    success: 'bg-green-500/20 border-green-500/30 text-green-200',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
    error: 'bg-red-500/20 border-red-500/30 text-red-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl glass border backdrop-blur-lg ${typeClasses[type]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div>{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Floating Particles Background Component
export const FloatingParticles = ({ count = 50, className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};