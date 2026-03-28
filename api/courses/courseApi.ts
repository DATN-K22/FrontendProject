import { authUtils } from '@/utils/auth'
import type { ApiResponse, CourseEntity, CreateCourseDto, UpdateCourseDto } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/api'

// ─── Helper ───────────────────────────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTljMGQwZS1lOWM3LTdiNzItOGZhOC1jZDM3MTg2YzY5NzQiLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MzMzMTMxMSwiZXhwIjoxNzczMzMyMjExfQ.7bgZojWy8BVflF6aBcpScRFokx3toQxbzpBRixZcODY`
    },
    ...options
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.message ?? `Request failed: ${res.status}`)
  }

  return res.json()
}

// ─── Query string builder ─────────────────────────────────────────────────────
function qs(params: Record<string, string | number | undefined>) {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) p.set(k, String(v))
  })
  const s = p.toString()
  return s ? `?${s}` : ''
}

// ─── Course API ───────────────────────────────────────────────────────────────

/**
 * GET /courses?owner_id=&offset=&limit=
 * List all courses for an owner.
 * Requires backend findAll to be enabled + owner_id query param supported.
 */
export async function getCoursesByOwner(ownerId: string, offset = 0, limit = 50): Promise<ApiResponse<CourseEntity[]>> {
  return request<CourseEntity[]>(`/courses/course${qs({ owner_id: ownerId, offset, limit })}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTljMGQwZS1lOWM3LTdiNzItOGZhOC1jZDM3MTg2YzY5NzQiLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MzMzMTMxMSwiZXhwIjoxNzczMzMyMjExfQ.7bgZojWy8BVflF6aBcpScRFokx3toQxbzpBRixZcODY`
    }
  })
}

/**
 * GET /courses/:id
 */
export async function getCourse(id: string | number): Promise<ApiResponse<CourseEntity>> {
  return request<CourseEntity>(`/courses/${id}`)
}

/**
 * POST /courses
 */
export async function createCourse(dto: CreateCourseDto): Promise<ApiResponse<CourseEntity>> {
  return request<CourseEntity>('/courses/course', {
    method: 'POST',
    body: JSON.stringify(dto),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMTljMGQwZS1lOWM3LTdiNzItOGZhOC1jZDM3MTg2YzY5NzQiLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MzMyOTUzOSwiZXhwIjoxNzczMzMwNDM5fQ.OIjRnZyiAghszWyi383c_1Uf5l_dlRB5NbaZ5XsXOkE`
    }
  })
}

/**
 * PATCH /courses/:id
 */
export async function updateCourse(id: string | number, dto: UpdateCourseDto): Promise<ApiResponse<CourseEntity>> {
  return request<CourseEntity>(`/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto)
  })
}

/**
 * DELETE /courses/:id
 */
export async function deleteCourse(id: string | number): Promise<ApiResponse<void>> {
  return request<void>(`/courses/${id}`, { method: 'DELETE' })
}

/**
 * GET /courses/user/:id/courses/incomplete/latest
 */
export async function getLatestIncompleteCourse(userId: string): Promise<ApiResponse<CourseEntity>> {
  return request<CourseEntity>(`/courses/user/${userId}/courses/incomplete/latest`)
}
