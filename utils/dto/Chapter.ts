import { LessonDetail, LessonGeneral } from './Lesson'

export type Chapter = {
  id: string
  title: string
  short_description: string
  status: string
  sort_order: number
  lessons: LessonGeneral[]
  progress: number
  course?: {
    id: string
    title: string
  }
}
