import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Users, Video, FileCheck } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" />
      
      {/* Gradient overlays for depth */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-teal-50 to-transparent" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-50 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                  <span className="block">Elevate Your</span>
                  <span className="block bg-gradient-to-r from-teal-600 to-purple-600 text-transparent bg-clip-text">
                    Iowa Real Estate Career
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join Iowa real estate professionals mastering real estate with our comprehensive CE courses
                </p>
              </motion.div>

              <motion.div 
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="rounded-md shadow">
                  <Link
                    to="/courses"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10 transition-all duration-200"
                  >
                    Start Learning Today
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link
                    to="/courses"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md bg-white text-teal-600 hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-200 shadow-sm"
                  >
                    Browse Courses
                  </Link>
                </div>
              </motion.div>

              {/* Features Grid */}
              <motion.div 
                className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {[
                  {
                    icon: Award,
                    title: "CE Approved",
                    subtitle: "Accredited Hours"
                  },
                  {
                    icon: Users,
                    title: "Expert Teachers",
                    subtitle: "Industry Leaders"
                  },
                  {
                    icon: Video,
                    title: "Live Sessions",
                    subtitle: "Interactive Learning"
                  },
                  {
                    icon: FileCheck,
                    title: "Instant Credit",
                    subtitle: "Auto Certificates"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="relative p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="relative">
                      <feature.icon className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">{feature.title}</p>
                      <p className="text-xs text-gray-500">{feature.subtitle}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}