import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const TopNavbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  return (
    <nav className="w-full bg-black/10 backdrop-blur-sm border-b border-white/10 px-4 sm:px-6 lg:px-8 relative z-50">
      <div className="flex items-center justify-between h-16">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          <Link 
            to="/dashboard" 
            className="text-2xl font-bold text-white hover:text-purple-300 transition-colors cursor-pointer"
          >
            MarkIt
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className={`relative transition-all font-medium px-3 py-2 rounded-lg ${
                location.pathname === '/dashboard' 
                  ? 'text-white bg-white/20 shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Dashboard
              {location.pathname === '/dashboard' && (
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
            <Link
              to="/subjects"
              className={`relative transition-all font-medium px-3 py-2 rounded-lg ${
                location.pathname.startsWith('/subjects') 
                  ? 'text-white bg-white/20 shadow-lg' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Subjects
              {location.pathname.startsWith('/subjects') && (
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Right side - Theme toggle and user info */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? '🌙' : '☀️'}
          </button>

          {/* User Avatar and Info */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-white/60">{user?.email}</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50"
              >
                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg mx-2 transition-colors ${
                      location.pathname === '/profile' 
                        ? 'text-white bg-white/20 shadow-lg' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    className={`flex items-center w-full px-4 py-2 text-sm rounded-lg mx-2 transition-colors ${
                      location.pathname === '/settings' 
                        ? 'text-white bg-white/20 shadow-lg' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <hr className="my-2 border-white/20 mx-2" />
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                      setShowDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors rounded-lg mx-2"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/20 backdrop-blur-md border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'text-white bg-white/20'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/subjects"
              onClick={() => setShowMobileMenu(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.startsWith('/subjects')
                  ? 'text-white bg-white/20'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Subjects
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default TopNavbar;