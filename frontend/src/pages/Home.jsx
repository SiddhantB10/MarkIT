import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    hidden: { y: 50, opacity: 0, rotateX: -10 },
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
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent)] animate-pulse"></div>
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-20 animate-morph pointer-events-none"
          style={{
            left: `${mousePosition.x * 0.01}px`,
            top: `${mousePosition.y * 0.01}px`,
          }}
        ></div>
        <div 
          className="absolute w-72 h-72 bg-gradient-to-r from-pink-400 to-red-600 rounded-full opacity-20 animate-float pointer-events-none"
          style={{
            right: `${mousePosition.x * 0.008}px`,
            bottom: `${mousePosition.y * 0.008}px`,
          }}
        ></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -20, 0],
              x: [null, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {/* Hero Section */}
          <div className="text-center mb-16 perspective-container">
            <motion.div
              variants={itemVariants}
              className="mb-8 card-3d"
            >
              <motion.h1
                className="text-7xl md:text-8xl font-bold mb-6 gradient-text"
                whileHover={{ 
                  scale: 1.05,
                  rotateX: 5,
                  rotateY: 5,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                MarkIt
              </motion.h1>
              
              <motion.div
                className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Experience the future of attendance tracking with elegant design, 
              powerful analytics, and seamless user experience.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <motion.button
                    className="btn-modern px-10 py-4 text-lg font-semibold text-white rounded-2xl glass border-2 border-white/20"
                    style={{ background: 'var(--gradient-primary)' }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateX: 5,
                      y: -5,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Enter Dashboard
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <motion.button
                      className="btn-modern px-10 py-4 text-lg font-semibold text-white rounded-2xl glass border-2 border-white/20"
                      style={{ background: 'var(--gradient-primary)' }}
                      whileHover={{ 
                        scale: 1.05,
                        rotateX: 5,
                        y: -5,
                        transition: { type: "spring", stiffness: 400 }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                  <Link to="/login">
                    <motion.button
                      className="btn-modern px-10 py-4 text-lg font-semibold text-gray-200 rounded-2xl glass-dark border-2 border-white/10"
                      whileHover={{ 
                        scale: 1.05,
                        rotateX: 5,
                        y: -5,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        transition: { type: "spring", stiffness: 400 }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign In
                    </motion.button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div 
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 mt-20"
          >
            {[
              {
                title: "Smart Analytics",
                description: "Get insights into your attendance patterns with advanced analytics",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Real-time Tracking", 
                description: "Mark attendance instantly with our modern interface",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                title: "Beautiful Design",
                description: "Enjoy a clean, modern interface with smooth animations",
                gradient: "from-green-500 to-teal-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card-3d p-8 rounded-2xl glass border border-white/10 text-center group"
                whileHover={{
                  rotateY: 5,
                  rotateX: 5,
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-8 h-8 bg-white rounded-lg opacity-90"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-20"
          >
            <motion.div
              className="inline-block p-8 rounded-2xl glass border border-white/10"
              whileHover={{
                rotateX: 5,
                rotateY: 5,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to transform your attendance tracking?
              </h3>
              <p className="text-gray-300 mb-6">
                Join students already using MarkIt for better attendance management
              </p>
              {!isAuthenticated && (
                <Link to="/register">
                  <motion.button
                    className="btn-modern px-8 py-3 text-white rounded-xl glass border border-white/20"
                    style={{ background: 'var(--gradient-secondary)' }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -3,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                  >
                    Start Your Journey
                  </motion.button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;