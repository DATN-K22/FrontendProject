import { useState } from 'react'
import api from '@/api/api'

import { authUtils } from '@/utils/auth'

export function useForumsByCourse(course_id?: string) {
  const [forums, setForums] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchForums = async () => {
    setLoading(true)
    setError(null)
    try {
      if (course_id) {
        const res = await api.get(`/courses/forums?course_id=${course_id}`)
        setForums(res.data)
      } else {
        const { userData } = authUtils.getAuth()
        const owner_id = userData?.id || userData?.sub
        if (!owner_id) throw new Error('User not found')

        // Fetch courses for the instructor
        const coursesRes = await api.get(`/courses/course?offset=0&limit=100&owner_id=${owner_id}`)
        const coursesList = coursesRes.data?.data?.courses || []
        setCourses(coursesList)

        // Then fetch forums for each course
        const forumPromises = coursesList.map(async (c: any) => {
          try {
            const res = await api.get(`/courses/forums?course_id=${c.id}`)
            return res.data || []
          } catch {
            return []
          }
        })
        const forumsArrays = await Promise.all(forumPromises)
        const allForums = forumsArrays.flat()
        setForums(allForums)
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi tải forums')
    } finally {
      setLoading(false)
    }
  }

  return { forums, courses, loading, error, fetchForums, setForums }
}

export function useCreateForum() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const create = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/courses/forums', data)
      return res.data
    } catch (err: any) {
      setError(err?.message || 'Lỗi tạo forum')
      return null
    } finally {
      setLoading(false)
    }
  }
  return { create, loading, error }
}

export function useUpdateForum() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const update = async (id: string, data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.patch(`/courses/forums/${id}`, data)
      return res.data
    } catch (err: any) {
      setError(err?.message || 'Lỗi cập nhật forum')
      return null
    } finally {
      setLoading(false)
    }
  }
  return { update, loading, error }
}

export function useDeleteForum() {
  const [loading, setLoading] = useState(false)
  const remove = async (id: string) => {
    setLoading(true)
    try {
      await api.delete(`/courses/forums/${id}`)
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }
  return { remove, loading }
}
