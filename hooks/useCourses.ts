'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/api/api'
import type { ApiResponse, CourseEntity, CoursesListData, CreateCourseDto, UpdateCourseDto } from '@/api/courses/types'

// ─── useCourse — fetch single course ──────────────────────────────────────────
export function useCourse(id: string | number | null) {
  const [course, setCourse] = useState<CourseEntity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<ApiResponse<CourseEntity>>(`/courses/course/${id}`)
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

// ─── useInstructorCoursesByOwner — list courses by owner with pagination ──────
export function useInstructorCoursesByOwner(ownerId: string, offset = 0, limit = 10) {
  const [courses, setCourses] = useState<CourseEntity[]>([])
  const [pageInfo, setPageInfo] = useState<CoursesListData['page'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!ownerId) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<ApiResponse<CoursesListData>>('/courses/course', {
        params: { owner_id: ownerId, offset, limit }
      })
      setCourses(res.data.data.courses)
      setPageInfo(res.data.data.page)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }, [ownerId, offset, limit])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { courses, setCourses, pageInfo, loading, error, refetch: fetchAll }
}

// ─── useCreateCourse ──────────────────────────────────────────────────────────
export function useCreateCourse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (dto: CreateCourseDto): Promise<CourseEntity | null> => {
    setLoading(true)
    setError(null)
    try {
      // Đảm bảo price là number khi gửi lên API
      const payload = {
        ...dto,
        price: dto.price ? Number(dto.price) : 0
      }
      const res = await api.post<ApiResponse<CourseEntity>>('/courses/course', payload)
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

  const update = useCallback(async (id: string | number, dto: UpdateCourseDto): Promise<CourseEntity | null> => {
    setLoading(true)
    setError(null)
    try {
      // Đảm bảo price là number khi gửi lên API nếu có
      const payload = {
        ...dto,
        ...(dto.price !== undefined ? { price: Number(dto.price) } : {})
      }
      const res = await api.patch<ApiResponse<CourseEntity>>(`/courses/course/${id}`, payload)
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
