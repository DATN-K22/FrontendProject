import { useState, useCallback, useEffect } from 'react'
import api from '@/api/api'

export function useChaptersByCourse(course_id: string | number) {
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/courses/chapters`, { params: { course_id } })
      setChapters(res.data)
    } catch (e: any) {
      setError(e.message || 'Failed to fetch chapters')
    } finally {
      setLoading(false)
    }
  }, [course_id])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { chapters, loading, error, refetch: fetch, setChapters }
}

export function useCreateChapter() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const create = useCallback(async (dto: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post(`/courses/chapters`, dto)
      return res.data
    } catch (e: any) {
      setError(e.message || 'Failed to create chapter')
      return null
    } finally {
      setLoading(false)
    }
  }, [])
  return { create, loading, error }
}

export function useUpdateChapter() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const update = useCallback(async (id: string | number, dto: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.patch(`/courses/chapters/${id}`, dto)
      return res.data
    } catch (e: any) {
      setError(e.message || 'Failed to update chapter')
      return null
    } finally {
      setLoading(false)
    }
  }, [])
  return { update, loading, error }
}

export function useDeleteChapter() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const remove = useCallback(async (id: string | number) => {
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/courses/chapters/${id}`)
      return true
    } catch (e: any) {
      setError(e.message || 'Failed to delete chapter')
      return false
    } finally {
      setLoading(false)
    }
  }, [])
  return { remove, loading, error }
}

export function useUpdateChapterOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateOrder = useCallback(
    async (course_id: string | number, dto: { chapters: { chapter_id: string; sort_order: number }[] }) => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.patch(`/courses/chapters/${course_id}/order`, dto)
        return res.data
      } catch (e: any) {
        const message = e.response?.data?.message || e.message || 'Failed to update chapter order'
        setError(message)
        throw e
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { updateOrder, loading, error }
}
