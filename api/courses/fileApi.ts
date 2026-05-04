import api from '@/api/api'
import { CreateFileDto, LessonResources } from './types'
import { ApiResponse } from '@/utils/dto/ApiResponse'
/**
 * GET /files/presigned-url/:course_id/:lesson_id/:filename
 * Get a temporary S3 URL for uploading a file directly from the client.
 */
