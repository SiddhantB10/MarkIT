import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  const containerClass = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          className={`
            ${sizeClasses[size]} 
            border-2 border-gray-200 
            ${colorClasses[color]} 
            border-t-transparent 
            rounded-full
          `}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        {text && (
          <motion.p
            className="text-sm text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;