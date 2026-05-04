import { RecommendedCourse } from '@/components/coursesWithGeneralInfo'

// ─── API Response wrapper (matches ApiResponse from backend) ─────────────────
export interface ApiResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
  timestamp: string
}

// ─── Course status ────────────────────────────────────────────────────────────
export type CourseStatus = 'draft' | 'published' | 'archived'

// ─── Course level ─────────────────────────────────────────────────────────────
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'AllLevels'

// ─── Course entity (matches backend response) ────────────────────────────────

// ─── Pagination info ──────────────────────────────────────────────────────────
export interface PaginationMeta {
  totalItems: number
  totalPages: number
  itemsPerPage: number
  currentPage: number
}
// ─── Courses list response data ───────────────────────────────────────────────
export interface CoursesListData {
  data: RecommendedCourse[]
  meta: PaginationMeta
}

// ─── CreateCourseDto ──────────────────────────────────────────────────────────
export interface CreateCourseDto {
  owner_id: string
  title: string
  short_description?: string
  long_description?: string
  thumbnail_url?: string
  price: string
  status?: CourseStatus
  course_level?: CourseLevel
  language?: string
}

// ─── UpdateCourseDto ──────────────────────────────────────────────────────────
export type UpdateCourseDto = Partial<CreateCourseDto>

// ─── File Resource ────────────────────────────────────────────────────────────
export type FileResourceType = 'video' | 'document' | 'image'

export interface FileResource {
  id: string | number
  title: string
  type: FileResourceType
  filename: string
  lesson_id: string
  course_id?: string
  created_at: string
  updated_at?: string
  link?: string | null
  thumb?: string | null
  manifest_url?: string | null
  path?: string
}

export interface LessonResources {
  video: FileResource[]
  document: FileResource[]
  image: FileResource[]
}

export interface CreateFileDto {
  title: string
  type: FileResourceType
  filename: string
  lesson_id: string
  course_id: string
}
