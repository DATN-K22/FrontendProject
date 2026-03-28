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
  enrollments: unknown[]
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
}

// ─── UpdateCourseDto ──────────────────────────────────────────────────────────
export type UpdateCourseDto = Partial<CreateCourseDto>
