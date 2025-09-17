import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="relative bg-white">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-purple-50" />
      
      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-teal-600 to-purple-600 text-transparent bg-clip-text">
            Ready to Start Your Real Estate Journey?
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Join thousands of successful investors who have transformed their careers through our courses.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10"
              >
                Browse Courses
              </Link>
            </div>
            <div className="ml-3 inline-flex">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}