import { Chapter } from "./Chapter";

export type LessonDetail = {
  id: string;
  title: string;
  status: string;
  type: string;
  short_description: string;
  long_description: string;
  sort_order: number;
  duration?: number; // in seconds
  isFinished: boolean;
  resources?: {
    video: {
      id: string;
      title: string;
      type: ResourceType;
      thumb: string;
      link: string;
      manifest_url: string;
    }[];
    document: {
      id: string;
      title: string;
      type: ResourceType;
      thumb: string;
      link: string;
      manifest_url: string;
    }[];
  };
  chapter?: Chapter;
};

enum ResourceType {
  video,
  document,
}

export type LessonGeneral = {
  id: string;
  title: string;
  status: string;
  type: string;
  sort_order: number;
  duration?: number;
  isFinished: boolean;
};
