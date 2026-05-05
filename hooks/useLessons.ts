import { useCallback, useState } from 'react'
import api from '@/api/api'

export function useLessonsByChapter(chapter_id: string) {
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLessons = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/courses/lessons?chapter_id=${chapter_id}&skip=0&take=100`)
      setLessons(res.data)
    } catch (err: any) {
      setError(err?.message || 'Lỗi tải lessons')
    } finally {
      setLoading(false)
    }
  }

  return { lessons, loading, error, fetchLessons, setLessons }
}

export function useCreateLesson() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const create = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/courses/lessons', data)
      return res.data
    } catch (err: any) {
      setError(err?.message || 'Lỗi tạo lesson')
      return null
    } finally {
      setLoading(false)
    }
  }
  return { create, loading, error }
}

export function useUpdateLesson() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const update = async (id: string, data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.patch(`/courses/lessons/${id}`, data)
      return res.data
    } catch (err: any) {
      setError(err?.message || 'Lỗi cập nhật lesson')
      return null
    } finally {
      setLoading(false)
    }
  }
  return { update, loading, error }
}

export function useDeleteLesson() {
  const [loading, setLoading] = useState(false)
  const remove = async (id: string) => {
    setLoading(true)
    try {
      await api.delete(`/courses/lessons/${id}`)
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }
  return { remove, loading }
}

export function useUpdateLessonOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateLessonOrder = async (
    course_id: string,
    chapter_id: string,
    dto: { lessons: { lesson_id: string; sort_order: number }[] }
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.patch(`/courses/lessons/${course_id}/${chapter_id}/order`, dto)
      return res.data
    } catch (e: any) {
      const message = e.response?.data?.message || e.message || 'Failed to update lesson order'
      setError(message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { updateLessonOrder, loading, error }
}
