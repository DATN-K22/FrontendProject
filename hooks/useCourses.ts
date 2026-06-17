'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/api/api'
import type {
  ApiResponse,
  CoursesListData,
  CreateCourseDto,
  PaginationMeta,
  UpdateCourseDto
} from '@/api/courses/types'
import { RecommendedCourse } from '@/components/CoursesWithGeneralInfo'

export const DEFAULT_META: PaginationMeta = {
  totalItems: 0,
  totalPages: 1,
  itemsPerPage: 12,
  currentPage: 1
}

// ─── useCourse — fetch single course ─────────────────────────────────────────

export function useCourse(id: string | number | null) {
  const [course, setCourse] = useState<RecommendedCourse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<ApiResponse<RecommendedCourse>>(`/courses/course/${id}`)
      setCourse(res.data.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch course')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { course, loading, error, refetch: fetch }
}

// ─── useInstructorCourses — offset-based list of courses by owner ─────────────

export function useInstructorCourses(ownerId: string, offset: number, limit = 12) {
  const [courses, setCourses] = useState<RecommendedCourse[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    if (!ownerId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<ApiResponse<CoursesListData>>('/courses/course', {
        params: { owner_id: ownerId, offset, limit }
      })
      setCourses(res.data.data.data)
      setMeta(res.data.data.meta ?? DEFAULT_META)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [ownerId, offset, limit])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return { courses, setCourses, meta, loading, error, refetch: fetchCourses }
}

// ─── useEnrolledCourses — offset-based enrolled courses ───────────────────────

export function useEnrolledCourses(userId: string, offset: number, limit = 12) {
  const [courses, setCourses] = useState<RecommendedCourse[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/courses/course/me/${userId}/enrolled?offset=${offset}&limit=${limit}`)
      const { data: courseList, meta: responseMeta } = res.data.data
      setCourses(courseList ?? [])
      setMeta(responseMeta ?? DEFAULT_META)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch enrolled courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [userId, offset, limit])

  useEffect(() => {
    fetchCourses()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchCourses])

  return { courses, meta, loading, error, refetch: fetchCourses }
}

// ─── useCreateCourse ──────────────────────────────────────────────────────────

export function useCreateCourse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (dto: CreateCourseDto): Promise<RecommendedCourse | null> => {
    setLoading(true)
    setError(null)
    try {
      const payload = { ...dto, price: dto.price ? Number(dto.price) : 0 }
      const res = await api.post<ApiResponse<RecommendedCourse>>('/courses/course', payload)
      return res.data.data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create course')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}

// ─── useUpdateCourse ──────────────────────────────────────────────────────────

export function useUpdateCourse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(async (id: string | number, dto: UpdateCourseDto): Promise<RecommendedCourse | null> => {
    setLoading(true)
    setError(null)
    try {
      const payload = { ...dto, ...(dto.price !== undefined ? { price: Number(dto.price) } : {}) }
      const res = await api.patch<ApiResponse<RecommendedCourse>>(`/courses/course/${id}`, payload)
      return res.data.data
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update course')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { update, loading, error }
}

// ─── useDeleteCourse ──────────────────────────────────────────────────────────

export function useDeleteCourse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/courses/course/${id}`)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete course')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { remove, loading, error }
}

/** @deprecated Use useInstructorCourses instead */
export function useInstructorCoursesByOwner(ownerId: string, offset = 0, limit = 12) {
  return useInstructorCourses(ownerId, offset, limit)
}
