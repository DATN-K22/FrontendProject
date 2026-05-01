import api from '@/api/api'
import type { ApiResponse, CreateFileDto, LessonResources } from './types'

/**
 * GET /files/presigned-url/:course_id/:lesson_id/:filename
 * Get a temporary S3 URL for uploading a file directly from the client.
 */
export async function getPresignedUrl(
  courseId: string | number,
  lessonId: string | number,
  filename: string
): Promise<ApiResponse<string>> {
  const res = await api.get(`/media/files/presigned-url/${courseId}/${lessonId}/${filename}`)
  return res.data
}

/**
 * POST /files
 * Save file information to the database after successful S3 upload.
 */
export async function saveFileInfo(dto: CreateFileDto): Promise<ApiResponse<any>> {
  const res = await api.post('/media/files', dto)
  return res.data
}

/**
 * GET /files/lesson/:id
 * Get all resources associated with a lesson, grouped by type.
 */
export async function getFilesByLesson(lessonId: string | number): Promise<ApiResponse<LessonResources>> {
  const res = await api.get(`/media/files/lesson/${lessonId}`)
  return res.data
}

/**
 * DELETE /files/:id
 * Delete a resource from the database and S3.
 */
export async function deleteFile(id: number | string): Promise<ApiResponse<void>> {
  const res = await api.delete(`/media/files/${id}`)
  return res.data
}
