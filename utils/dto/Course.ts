import { Chapter } from "./Chapter";

export type Course = {
  id: string;
  thumbnail_url: string;
  title: string;
  course_level: CourseLevel;
  short_description: string;
  long_description: string;
  created_at: string;
  user: {
    name: string;
    avt_url: string;
  };
  rating: number;
  price: number;
  isEnrolled: boolean;
  chapters: {
    chapters: Chapter[];
    progress: number;
  };
};

enum CourseLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
  AllLevels = "All Levels",
}
