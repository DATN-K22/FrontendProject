import { LessonDetail } from "./Lesson";

export type Chapter = {
  id: string;
  title: string;
  short_description: string;
  status: string;
  sort_order: number;
  lessons: LessonDetail[];
  progress: number;
  course?: {
    id: string;
    title: string;
  };
};
