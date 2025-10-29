import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(data);
      
      if (result.success) {
        toast.success('Login successful!');
        // Navigation will be handled by the auth context
      } else {
        // Handle specific error messages
        const errorMsg = result.error || 'Login failed';
        setError(errorMsg);
        
        // Show specific error messages based on the error
        if (errorMsg.toLowerCase().includes('user not found') || 
            errorMsg.toLowerCase().includes('no account') ||
            errorMsg.toLowerCase().includes('not found') ||
            errorMsg.toLowerCase().includes('does not exist')) {
          toast.error('No account found with this email address. Please sign up first.');
        } else if (errorMsg.toLowerCase().includes('password') && 
                   errorMsg.toLowerCase().includes('incorrect')) {
          toast.error('Incorrect password. Please try again.');
        } else if (errorMsg.toLowerCase().includes('invalid')) {
          toast.error('Invalid login credentials. Please check your email and password.');
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0, rotateX: -10 },
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
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.4),transparent)]"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <motion.h1
              className="text-4xl font-bold gradient-text mb-4"
              whileHover={{
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              Welcome Back
            </motion.h1>
            <p className="text-gray-300 text-lg">
              Sign in to continue your journey
            </p>
            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-4 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.div>

          {/* Login Card */}
          <motion.div
            variants={itemVariants}
            className="card-3d p-8 rounded-3xl glass border border-white/10 backdrop-blur-xl"
            whileHover={{
              rotateX: 2,
              rotateY: 2,
              transition: { type: "spring", stiffness: 300 }
            }}
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-2xl text-sm backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Email Address
                  </label>
                  <motion.input
                    whileFocus={{
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-300">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Password
                  </label>
                  <motion.input
                    whileFocus={{
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    type="password"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-300">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed btn-modern"
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  transition: { type: "spring", stiffness: 400 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            <motion.div 
              variants={itemVariants}
              className="mt-8 text-center"
            >
              <p className="text-gray-300">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
                >
                  Create one here
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-8"
          >
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center justify-center"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;