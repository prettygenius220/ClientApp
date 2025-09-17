export interface Course {
  id: string;
  course_number?: string;
  title: string;
  description: string;
  image: string;
  price: number;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  lessons: Lesson[];
  enrolledStudents?: number;
  rating?: number;
  reviews?: number;
  published?: boolean;
  isVirtual?: boolean;
  meetLink?: string;
  startTime?: string;
  endTime?: string;
  isEnrolled?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content?: string;
  completed?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  courseCount: number;
}