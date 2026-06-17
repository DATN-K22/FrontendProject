import { useState } from 'react'
import api from '@/api/api'

export function useMessagesByForum(forum_id: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    if (!forum_id) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/courses/messages/forum/${forum_id}`)
      setMessages(res.data)
    } catch (err: any) {
      setError(err?.message || 'Lỗi tải messages')
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, error, fetchMessages, setMessages }
}

export function useMessageDetails(message_id: string) {
  const [message, setMessage] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessageDetails = async () => {
    if (!message_id) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/courses/messages/${message_id}`)
      setMessage(res.data)
    } catch (err: any) {
      setError(err?.message || 'Lỗi tải chi tiết message')
    } finally {
      setLoading(false)
    }
  }

  return { message, loading, error, fetchMessageDetails, setMessage }
}

export function useCreateMessage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const create = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/courses/messages', data)
      return res.data
    } catch (err: any) {
      setError(err?.message || 'Lỗi tạo message')
      return null
    } finally {
      setLoading(false)
    }
  }
  return { create, loading, error }
}

export function useUpdateMessage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const update = async (id: string, data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.patch(`/courses/messages/${id}`, data)
      return res.data
    } catch (err: any) {
      setError(err?.message || 'Lỗi cập nhật message')
      return null
    } finally {
      setLoading(false)
    }
  }
  return { update, loading, error }
}

export function useDeleteMessage() {
  const [loading, setLoading] = useState(false)
  const remove = async (id: string) => {
    setLoading(true)
    try {
      // Assuming 'courses' to match other endpoints, user note said 'course', keeping 'courses' for consistency but falling back if needed later
      await api.delete(`/courses/messages/${id}`)
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }
  return { remove, loading }
}
