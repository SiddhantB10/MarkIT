import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BackButton = ({ to, label, className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getBackPath = () => {
    if (to) return to;
    
    // Smart back navigation based on current page
    const currentPath = location.pathname;
    
    if (currentPath.startsWith('/subjects/')) {
      return '/subjects'; // From subject detail back to subjects list
    }
    
    if (currentPath === '/subjects' || currentPath === '/settings' || currentPath === '/profile') {
      return '/dashboard'; // From main pages back to dashboard
    }
    
    return '/dashboard'; // Default fallback
  };

  const getBackLabel = () => {
    if (label) return label;
    
    // Smart label based on current page
    const currentPath = location.pathname;
    
    if (currentPath.startsWith('/subjects/')) {
      return 'Back to Subjects';
    }
    
    if (currentPath === '/subjects') {
      return 'Back to Dashboard';
    }
    
    if (currentPath === '/settings') {
      return 'Back to Dashboard';
    }
    
    if (currentPath === '/profile') {
      return 'Back to Dashboard';
    }
    
    return 'Back';
  };

  const handleClick = () => {
    navigate(getBackPath());
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 shadow-lg ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {getBackLabel()}
    </motion.button>
  );
};

export default BackButton;