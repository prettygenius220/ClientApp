import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Video, Award, Users, FileCheck, BookOpen, Clock } from 'lucide-react';

export default function Categories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-teal-500 to-purple-600 text-transparent bg-clip-text">
            Why Choose Our CE Courses?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Comprehensive education designed for real estate professionals
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {[
            {
              icon: Video,
              title: "Live Interactive Sessions",
              description: "Engage directly with expert instructors in real-time through our virtual classroom."
            },
            {
              icon: Award,
              title: "CE Credit Approved",
              description: "Earn required continuing education credits while expanding your expertise."
            },
            {
              icon: Users,
              title: "Industry Experts",
              description: "Learn from seasoned professionals with decades of real estate experience."
            },
            {
              icon: FileCheck,
              title: "Instant Certificates",
              description: "Receive your CE certificates immediately upon course completion."
            },
            {
              icon: BookOpen,
              title: "Comprehensive Content",
              description: "Cover essential topics from title research to closing procedures."
            },
            {
              icon: Clock,
              title: "Convenient Access",
              description: "Join sessions from anywhere using our simple online platform."
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-teal-500 to-purple-600">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}