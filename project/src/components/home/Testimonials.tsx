import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    content: "Jes has an incredible ability to break down complex concepts into clear, engaging lessons that make learning both fun and practical. Her teaching style is not only informative but also deeply inspiring, empowering students to think critically and apply their knowledge in real-world scenarios.",
    author: "Joe S.",
    role: "Real Estate Broker",
    rating: 5
  },
  {
    id: 2,
    content: "Free CE for real estate agents is a game-changer! Staying up to date with industry knowledge and maintaining my license without extra costs is invaluable. Quality courses, relevant topics, and no financial burden—it’s a win-win for any agent looking to grow and stay compliant!",
    author: "Courtney R.",
    role: "Real Estate Agent",
    rating: 5
  },
  {
    id: 3,
    content: "Jes doesn’t just teach—she entertains! Her humor makes learning fun, engaging, and memorable. She has a way of turning even the driest real estate topics into something you’ll actually enjoy. If you want to laugh while you learn, Jes is the teacher for you.",
    author: "Hunter H.",
    role: "Real Estate Coach",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="relative bg-white">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-teal-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-teal-600 to-purple-600 text-transparent bg-clip-text">
            What Our Students Say
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Hear from our successful students who have transformed their real estate careers
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-white rounded-lg shadow-sm p-8 relative hover:shadow-md transition-shadow duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-purple-50 rounded-lg opacity-50" />
              <div className="relative">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}