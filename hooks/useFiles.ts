import { useState, useCallback } from 'react'
import axios from 'axios'
import { getPresignedUrl, saveFileInfo, getFilesByLesson, deleteFile } from '@/api/courses/fileApi'
import { LessonResources, CreateFileDto, FileResourceType } from '@/api/courses/types'

export function useFilesByLesson(lessonId: string | number) {
  const [resources, setResources] = useState<LessonResources>({ video: [], document: [], image: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResources = useCallback(async () => {
    if (!lessonId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getFilesByLesson(lessonId)
      if (res.success) {
        setResources(res.data)
      } else {
        setError(res.message || 'Lỗi tải tài nguyên')
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi kết nối server')
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  return { resources, loading, error, fetchResources, setResources }
}

export function useUploadFile() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = async (
    file: File,
    data: { title: string; type: FileResourceType; lesson_id: string; course_id: string }
  ) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // 1. Lấy Presigned URL
      const presignedRes = await getPresignedUrl(data.course_id, data.lesson_id, file.name)
      if (!presignedRes.success) throw new Error(presignedRes.message)
      const uploadUrl = presignedRes.data

      // 2. Upload qua Next.js Server Proxy để lách CORS của S3
      const uploadRes = await fetch('/api/proxy-s3', {
        method: 'PUT',
        body: file,
        headers: {
          'x-target-url': uploadUrl,
          'Content-Type': file.type || 'application/octet-stream'
        }
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => null);
        const errorMsg = errorData?.error || uploadRes.statusText;
        console.error('S3 Upload Error:', errorMsg);
        throw new Error(`Lỗi upload S3: ${errorMsg}`);
      }

      // 3. Lưu thông tin vào Database
      const saveDto: CreateFileDto = {
        title: data.title,
        type: data.type,
        filename: file.name,
        lesson_id: data.lesson_id,
        course_id: data.course_id
      }
      const saveRes = await saveFileInfo(saveDto)
      if (!saveRes.success) throw new Error(saveRes.message)

      return saveRes.data
    } catch (err: any) {
      setError(err?.message || 'Lỗi tải lên file')
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, progress, error }
}

export function useDeleteFile() {
  const [deleting, setDeleting] = useState(false)
  
  const remove = async (id: number | string) => {
    setDeleting(true)
    try {
      const res = await deleteFile(id)
      return res.success
    } catch {
      return false
    } finally {
      setDeleting(false)
    }
  }
  
  return { remove, deleting }
}
