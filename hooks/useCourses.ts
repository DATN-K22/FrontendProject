'use client'
import { useState, useEffect, useCallback } from 'react'
import { getCourse, createCourse, updateCourse, deleteCourse } from '@/api/courses/courseApi'
import type { CourseEntity, CreateCourseDto, UpdateCourseDto } from '@/api/courses/types'

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
      const res = await getCourse(id)
      setCourse(res.data)
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

// ─── useInstructorCourses — list courses by owner ─────────────────────────────
// Note: findAll is commented out in the backend controller.
// This hook fetches courses by their IDs or is left ready for when
// the GET /courses endpoint is enabled.
export function useInstructorCourses(courseIds: (string | number)[]) {
  const [courses, setCourses] = useState<CourseEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    if (!courseIds.length) {
      setCourses([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(courseIds.map((id) => getCourse(id)))
      setCourses(results.map((r) => r.data))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(courseIds)]) // eslint-disable-line

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { courses, loading, error, refetch: fetchAll }
}

// ─── useCreateCourse ──────────────────────────────────────────────────────────
export function useCreateCourse() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (dto: CreateCourseDto): Promise<CourseEntity | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await createCourse(dto)
      return res.data
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
      const res = await updateCourse(id, dto)
      return res.data
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
      await deleteCourse(id)
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
