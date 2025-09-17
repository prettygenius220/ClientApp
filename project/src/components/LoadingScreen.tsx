import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <GraduationCap className="h-16 w-16 text-teal-600 mb-4" />
        <div>
          <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            RealEdu
          </span>
          <p className="text-sm text-gray-500 -mt-1 text-center">CE Provider</p>
        </div>
        <div className="mt-8 w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: 'linear'
            }}
            className="w-12 h-full bg-gradient-to-r from-teal-600 to-purple-600"
          />
        </div>
      </motion.div>
    </div>
  );
}