import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <div className="h-screen w-screen bg-background">
      {/* Full screen main content - no sidebar, no separate header */}
      <main className="h-full w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;