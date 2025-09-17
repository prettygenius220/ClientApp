import Hero from '../components/home/Hero';
import FeaturedCourseAd from '../components/home/FeaturedCourseAd';
import FeaturedCourses from '../components/home/FeaturedCourses';
import Categories from '../components/home/Categories';
import Testimonials from '../components/home/Testimonials';
import CTASection from '../components/home/CTASection';

export default function Home() {
  return (
    <div>
      <Hero />
      <FeaturedCourseAd />
      <FeaturedCourses />
      <Categories />
      <Testimonials />
      <CTASection />
    </div>
  );
}