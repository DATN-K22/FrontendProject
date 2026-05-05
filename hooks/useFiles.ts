import { useState, useCallback } from 'react'
import { LessonResources, CreateFileDto, FileResourceType } from '@/api/courses/types'
import api from '@/api/api'
import { ApiResponse } from '@/utils/dto/ApiResponse'

/* =========================
   Internal Helpers
========================= */

async function handleApi<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise
  if (!res.data.success) throw new Error(res.data.message)
  return res.data.data
}

function useAsyncState() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (err: any) {
      setError(err?.message || 'Unexpected error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, run, setError }
}

/* =========================
   API Functions
========================= */

export const getPresignedUrl = (courseId: string | number, lessonId: string | number, filename: string) =>
  handleApi<string>(api.get(`/media/files/presigned-url/${courseId}/${lessonId}/${filename}`))

export const saveFileInfo = (dto: CreateFileDto) => handleApi<any>(api.post('/media/files', dto))

export const getFilesByLesson = (lessonId: string | number) =>
  handleApi<LessonResources>(api.get(`/media/files/lesson/${lessonId}`))

export const getFilesByChapterItemId = (chapterItemId: string | number) =>
  handleApi<LessonResources>(api.get(`/media/files/chapter-item/${chapterItemId}`))

export const deleteFile = (id: number | string) => handleApi<void>(api.delete(`/media/files/${id}`))

/* =========================
   Hooks
========================= */

export function useFilesByLesson(lessonId: string | number) {
  const [resources, setResources] = useState<LessonResources>({
    video: [],
    document: [],
    image: []
  })

  const { loading, error, run } = useAsyncState()

  const fetchResources = useCallback(async () => {
    if (!lessonId) return
    const data = await run(() => getFilesByLesson(lessonId))
    if (data) setResources(data)
  }, [lessonId])

  return { resources, loading, error, fetchResources, setResources }
}

/* =========================
   Upload Hook
========================= */

async function uploadToS3(file: File, uploadUrl: string): Promise<void> {
  const res = await fetch('/api/proxy-s3', {
    method: 'PUT',
    body: file,
    headers: {
      'x-target-url': uploadUrl,
      'Content-Type': file.type || 'application/octet-stream'
    }
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || res.statusText)
  }
}

export function useUploadFile() {
  const [progress, setProgress] = useState(0)
  const { loading: uploading, error, run, setError } = useAsyncState()

  const upload = async (
    file: File,
    data: { title: string; type: FileResourceType; lesson_id: string; course_id: string }
  ) => {
    setProgress(0)

    return run(async () => {
      // 1. Get presigned URL
      const uploadUrl = await getPresignedUrl(data.course_id, data.lesson_id, file.name)

      // 2. Upload file
      await uploadToS3(file, uploadUrl)
      setProgress(80)

      // 3. Save metadata
      const result = await saveFileInfo({
        title: data.title,
        type: data.type,
        filename: file.name,
        lesson_id: data.lesson_id,
        course_id: data.course_id
      })

      setProgress(100)
      return result
    })
  }

  return { upload, uploading, progress, error, setError }
}

/* =========================
   Delete Hook
========================= */

export function useDeleteFile() {
  const { loading: deleting, run } = useAsyncState()

  const remove = async (id: number | string): Promise<boolean> => {
    const res = await run(() => deleteFile(id))
    return res !== null
  }

  return { remove, deleting }
}
