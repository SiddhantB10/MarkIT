import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register: authRegister, isAuthenticated } = useAuth();
  
  const {
    register,
    handleSubmit: formHandleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const password = watch('password', '');

  const validatePassword = (value) => {
    if (!value) return true; // Let required validation handle empty values
    
    const checks = {
      minLength: value.length >= 6,
      hasUpperCase: /[A-Z]/.test(value),
      hasLowerCase: /[a-z]/.test(value),
      hasNumbers: /\d/.test(value)
    };
    
    const allValid = Object.values(checks).every(Boolean);
    return allValid || 'Password must be at least 6 characters with uppercase, lowercase, and numbers';
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authRegister({
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      if (result.success) {
        toast.success('Registration successful! Welcome aboard!');
        // Navigation will be handled by the auth context
      } else {
        const errorMsg = result.error || 'Registration failed';
        setError(errorMsg);
        
        if (errorMsg.toLowerCase().includes('already exists') || 
            errorMsg.toLowerCase().includes('already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
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
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.4),transparent)]"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/30 to-teal-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/30 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -40, 0],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
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
              Create Account
            </motion.h1>
            <p className="text-gray-300 text-lg">
              Join the future of attendance tracking
            </p>
            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto mt-4 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.div>

          {/* Register Card */}
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

            <form onSubmit={formHandleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Full Name
                  </label>
                  <motion.input
                    whileFocus={{
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    type="text"
                    {...register('name', { 
                      required: 'Full name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-300">{errors.name.message}</p>
                  )}
                </div>

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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
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
                      validate: validatePassword
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Create a password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-300">{errors.password.message}</p>
                  )}
                  
                  {/* Password Requirements */}
                  {password && (
                    <div className="mt-3 space-y-2">
                      {[
                        { check: password.length >= 6, text: 'At least 6 characters' },
                        { check: /[A-Z]/.test(password), text: 'One uppercase letter' },
                        { check: /[a-z]/.test(password), text: 'One lowercase letter' },
                        { check: /\d/.test(password), text: 'One number' }
                      ].map((req, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <div className={`w-2 h-2 rounded-full mr-2 ${req.check ? 'bg-emerald-400' : 'bg-gray-500'}`}></div>
                          <span className={req.check ? 'text-emerald-300' : 'text-gray-400'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Confirm Password
                  </label>
                  <motion.input
                    whileFocus={{
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    type="password"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-300">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed btn-modern mt-6"
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
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>

            <motion.div 
              variants={itemVariants}
              className="mt-6 text-center"
            >
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200"
                >
                  Sign in here
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

export default Register;