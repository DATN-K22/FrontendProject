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
export interface CourseEntity {
  id: string
  owner_id: string
  title: string
  short_description: string
  long_description: string
  thumbnail_url: string
  price: string // backend returns string
  status: CourseStatus
  created_at: string
  enrollments?: unknown[]
  course_level?: CourseLevel
  rating?: number
  language?: string
}

// ─── Pagination info ──────────────────────────────────────────────────────────
export interface PageInfo {
  total_pages: number
  total_items: number
  offset: number
  limit: number
}

// ─── Courses list response data ───────────────────────────────────────────────
export interface CoursesListData {
  courses: CourseEntity[]
  page: PageInfo
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
