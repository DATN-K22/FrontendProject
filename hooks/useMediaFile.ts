import api from '@/api/api'
import { CreateFileDto, LessonResources } from '@/api/courses/types'
import { ApiResponse } from '@/utils/dto/ApiResponse'
import axios from 'axios'
import { useCallback, useRef, useState } from 'react'
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
 * GET /files/chapter-item/:id
 * Get all resources associated with a chapter item (lesson) by chapter item ID.
 */
export async function getFilesByChapterItemId(chapterItemId: string | number): Promise<ApiResponse<LessonResources>> {
  const res = await api.get(`/media/files/chapter-item/${chapterItemId}`)
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

const PART_SIZE = 50 * 1024 * 1024 // 50MB

export type VideoUploadStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'error'

export interface VideoUploadState {
  file?: File
  uploadId?: string
  progress: number
  status: VideoUploadStatus
  error?: string
}

export function useMultipartUploadVideo(courseId: string, lessonId: string) {
  const [state, setState] = useState<VideoUploadState>({ progress: 0, status: 'idle' })
  const abortRef = useRef(false)

  const patch = (partial: Partial<VideoUploadState>) => setState((prev) => ({ ...prev, ...partial }))

  const upload = useCallback(
    async (file: File) => {
      abortRef.current = false
      patch({ file, status: 'uploading', progress: 0, error: undefined })

      try {
        // 1. Init multipart upload via api helper
        const initRes = await api.post('/media/files/video/init', {
          title: file.name,
          courseId,
          lessonId,
          fileSize: file.size
        })
        const { uploadId, totalParts } = initRes.data?.data ?? {}
        patch({ uploadId })

        // 2. Upload parts
        const uploadedParts: { partNumber: number; etag: string }[] = []

        for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
          if (abortRef.current) throw new Error('Upload cancelled')

          const start = (partNumber - 1) * PART_SIZE
          const end = Math.min(start + PART_SIZE, file.size)
          const chunk = file.slice(start, end)

          // Get presigned URL for this part on-demand
          const urlRes = await api.post(`/media/files/video/${uploadId}/presigned-url`, { partNumber })
          const { presignedUrl } = urlRes.data?.data ?? {}

          // PUT chunk directly to S3 via axios — retry up to 3 times
          const etag = await uploadPartWithRetry(presignedUrl, chunk, 3)
          uploadedParts.push({ partNumber, etag })

          patch({ progress: Math.round((partNumber / totalParts) * 100) })
        }

        // 3. Complete
        await api.post(`/media/files/video/${uploadId}/complete`, { parts: uploadedParts })

        // Mark as ready immediately upon successful completion
        patch({ status: 'ready', progress: 100 })
      } catch (err: any) {
        if (!abortRef.current) {
          patch({ status: 'error', error: err.message })
        }
      }
    },
    [courseId, lessonId]
  )

  // Resume: fetch missing parts from S3 and continue
  const resume = useCallback(async (file: File, uploadId: string) => {
    abortRef.current = false
    patch({ file, uploadId, status: 'uploading', error: undefined })

    try {
      const partsRes = await api.get(`/media/files/video/${uploadId}/parts`)
      const { missingParts, uploadedParts: doneParts } = partsRes.data?.data ?? {}

      const totalParts = doneParts.length + missingParts.length
      const collectedParts = [...doneParts.map((p: any) => ({ partNumber: p.partNumber, etag: p.etag }))]

      for (const partNumber of missingParts as number[]) {
        if (abortRef.current) throw new Error('Upload cancelled')

        const start = (partNumber - 1) * PART_SIZE
        const chunk = file.slice(start, Math.min(start + PART_SIZE, file.size))

        const urlRes = await api.post(`/media/files/video/${uploadId}/presigned-url`, { partNumber })
        const { presignedUrl } = urlRes.data?.data ?? {}
        const etag = await uploadPartWithRetry(presignedUrl, chunk, 3)
        collectedParts.push({ partNumber, etag })

        patch({ progress: Math.round((collectedParts.length / totalParts) * 100) })
      }

      await api.post(`/media/files/video/${uploadId}/complete`, { parts: collectedParts })

      patch({ status: 'ready', progress: 100 })
    } catch (err: any) {
      patch({ status: 'error', error: err.message })
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current = true
    patch({ status: 'idle', progress: 0 })
  }, [])

  return { state, upload, resume, cancel }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function uploadPartWithRetry(presignedUrl: string, chunk: Blob, maxAttempts: number): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await axios.put(presignedUrl, chunk, { maxContentLength: Infinity, maxBodyLength: Infinity })
      if (res.status < 200 || res.status >= 300) throw new Error(`S3 PUT failed: ${res.status}`)
      const etag = res.headers?.etag || res.headers?.ETag
      if (!etag) throw new Error('Missing ETag in S3 response')
      return etag
    } catch (err) {
      if (attempt === maxAttempts) throw err
      await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1))) // exponential backoff
    }
  }
  throw new Error('Upload failed after max retries')
}

export interface DocumentItem {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  key?: string
  error?: string
}

interface PresignedUrlResult {
  filename: string
  contentType: string
  key: string
  presignedUrl: string
  expiresAt: string
}

export function useUploadDocuments(courseId: string, lessonId: string) {
  const [documents, setDocuments] = useState<DocumentItem[]>([])

  // Use ref to always have latest documents in callbacks without stale closure
  const documentsRef = useRef<DocumentItem[]>([])
  documentsRef.current = documents

  const patchDoc = useCallback((id: string, partial: Partial<DocumentItem>) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...partial } : d)))
  }, [])

  const uploadAll = useCallback(
    async (items: DocumentItem[]) => {
      if (items.length === 0) return

      try {
        // 1. Get presigned URLs for all files at once
        const presignedRes = await api.post('/media/files/presigned-urls', {
          courseId,
          lessonId: lessonId,
          files: items.map((d) => ({
            filename: d.file.name,
            contentType: 'application/pdf'
          }))
        })

        const urlList: PresignedUrlResult[] = presignedRes.data?.data ?? []

        if (urlList.length !== items.length) {
          throw new Error('Server returned mismatched number of presigned URLs')
        }

        // 2. Upload each file directly to S3 in parallel
        // Map by INDEX (not filename) because server renames files with timestamp-slug
        const uploadResults = await Promise.allSettled(
          items.map(async (docItem, index) => {
            const urlData = urlList[index]
            if (!urlData) throw new Error(`No presigned URL for ${docItem.file.name}`)

            patchDoc(docItem.id, { status: 'uploading', progress: 0 })

            await axios.put(urlData.presignedUrl, docItem.file, {
              headers: { 'Content-Type': 'application/pdf' },
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                  patchDoc(docItem.id, { progress: percent })
                }
              }
            })

            patchDoc(docItem.id, { status: 'done', progress: 100, key: urlData.key })

            return { docItem, key: urlData.key, serverFilename: urlData.filename }
          })
        )

        // 3. Mark failed uploads
        uploadResults.forEach((result, i) => {
          if (result.status === 'rejected') {
            patchDoc(items[i].id, {
              status: 'error',
              progress: 0,
              error: (result as PromiseRejectedResult).reason?.message ?? 'Upload failed'
            })
          }
        })

        // 4. Save only successful uploads to DB
        const succeeded = uploadResults
          .filter(
            (r): r is PromiseFulfilledResult<{ docItem: DocumentItem; key: string; serverFilename: string }> =>
              r.status === 'fulfilled'
          )
          .map((r) => r.value)

        if (succeeded.length > 0) {
          await api.post('/media/files', {
            files: succeeded.map(({ docItem, serverFilename }) => ({
              title: docItem.file.name,
              type: 'document',
              // Use the server-formatted filename (timestamp-slug.pdf) so DB and S3 stay in sync
              filename: serverFilename,
              course_id: courseId,
              chapter_item_id: lessonId
            }))
          })
        }
      } catch (err: any) {
        // If the presigned URL call itself fails, mark all items as error
        items.forEach((d) =>
          patchDoc(d.id, {
            status: 'error',
            progress: 0,
            error: err?.response?.data?.message ?? err.message ?? 'Unknown error'
          })
        )
      }
    },
    [courseId, lessonId, patchDoc]
  )

  const addFiles = useCallback(
    (files: File[]) => {
      const newItems: DocumentItem[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'pending'
      }))

      setDocuments((prev) => [...prev, ...newItems])
      uploadAll(newItems)
    },
    [uploadAll]
  )

  const retry = useCallback(
    (id: string) => {
      const doc = documentsRef.current.find((d) => d.id === id)
      if (!doc) return

      // Reset state in place first, then re-upload the same item
      patchDoc(id, { status: 'pending', progress: 0, error: undefined })
      uploadAll([doc])
    },
    [patchDoc, uploadAll]
  )

  const remove = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }, [])

  return { documents, addFiles, retry, remove }
}
