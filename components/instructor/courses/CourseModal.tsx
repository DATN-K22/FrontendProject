'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  CircularProgress,
  LinearProgress
} from '@mui/material'
import { Camera, Upload, X } from 'lucide-react'
import type { CourseLevel, CreateCourseDto, UpdateCourseDto, FileResourceType } from '@/api/courses/types'
import SafeHtml from '@/components/SafeHtml'
import { useUploadFile } from '@/hooks/useFiles'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
]

const COURSE_LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'AllLevels', label: 'All Levels' }
]

interface CourseModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCourseDto | UpdateCourseDto) => Promise<void>
  editingCourse?: CreateCourseDto | UpdateCourseDto | null
  ownerId?: string
  loading?: boolean
  error?: string | null
}

const EMPTY: CreateCourseDto = {
  owner_id: '',
  title: '',
  short_description: '',
  long_description: '',
  thumbnail_url: '',
  price: '',
  status: 'draft',
  course_level: 'AllLevels'
}

export default function CourseModal({
  open,
  onClose,
  onSubmit,
  editingCourse,
  ownerId,
  loading,
  error
}: CourseModalProps) {
  const isEdit = !!editingCourse
  const [form, setForm] = useState<CreateCourseDto>(EMPTY)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [thumbnailName, setThumbnailName] = useState('')
  const [thumbnailError, setThumbnailError] = useState('')
  const { upload, uploading, progress } = useUploadFile()

  useEffect(() => {
    if (editingCourse) {
      setForm({
        owner_id: editingCourse.owner_id ?? '',
        title: editingCourse.title ?? '',
        short_description: editingCourse.short_description ?? '',
        long_description: editingCourse.long_description ?? '',
        thumbnail_url: editingCourse.thumbnail_url ?? '',
        price: editingCourse.price ?? '',
        status: (editingCourse.status as CreateCourseDto['status']) ?? 'draft',
        course_level: (editingCourse.course_level as CourseLevel) ?? 'AllLevels'
      })
      setThumbnailPreview(editingCourse.thumbnail_url ?? '')
      setThumbnailName('')
      setThumbnailError('')
    } else {
      setForm(EMPTY)
      setThumbnailPreview('')
      setThumbnailName('')
      setThumbnailError('')
    }
  }, [editingCourse, open])

  function set(field: keyof CreateCourseDto, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit() {
    await onSubmit(form)
  }

  async function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const uploadContextId = String(editingCourse?.id ?? ownerId ?? '').trim()
    if (!uploadContextId) {
      setThumbnailError('Missing course context for thumbnail upload.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setThumbnailError('Please choose an image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setThumbnailError('Maximum image size is 5MB.')
      return
    }

    setThumbnailError('')
    setThumbnailName(file.name)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      fontSize: '0.875rem',
      '& fieldset': { borderColor: '#e2e8f0' },
      '&:hover fieldset': { borderColor: '#94a3b8' },
      '&.Mui-focused fieldset': { borderColor: '#2563eb' }
    },
    '& .MuiInputLabel-root': { fontSize: '0.875rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#2563eb' }
  }

  const uploadBtnSx = {
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 700,
    px: 2.5,
    boxShadow: 'none',
    border: '1.5px solid #e2e8f0',
    color: '#374151',
    '&:hover': { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }
  }

  const isBusy = loading || uploading

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 0 } }}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
          {isEdit ? 'Edit Course' : 'Add New Course'}
        </Typography>
        <Box
          onClick={onClose}
          sx={{ cursor: 'pointer', color: '#94a3b8', display: 'flex', '&:hover': { color: '#111827' } }}
        >
          <X size={20} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>Thumbnail</Typography>
            <Box
              sx={{
                border: '1.5px dashed #cbd5e1',
                borderRadius: '14px',
                p: 2,
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                bgcolor: '#f8fafc'
              }}
            >
              <Box
                sx={{
                  width: 96,
                  height: 64,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  bgcolor: '#e2e8f0',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {thumbnailPreview ? (
                  <Box
                    component='img'
                    src={thumbnailPreview}
                    alt='Thumbnail preview'
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Camera size={20} color='#64748b' />
                )}
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                  {thumbnailName || 'Choose an image file'}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.25 }}>
                  PNG, JPG, WEBP up to 5MB. The uploaded URL is stored in the existing request payload.
                </Typography>
              </Box>

              <Button
                component='label'
                variant='outlined'
                sx={uploadBtnSx}
                startIcon={<Upload size={14} />}
                disabled={isBusy}
              >
                Upload
                <input type='file' hidden accept='image/*' onChange={handleThumbnailChange} />
              </Button>
            </Box>

            {uploading && (
              <LinearProgress variant='determinate' value={progress} sx={{ borderRadius: 999, height: 4 }} />
            )}
            {(thumbnailError || error) && (
              <Box
                sx={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', px: 2, py: 1.5 }}
              >
                <Typography sx={{ fontSize: '0.8rem', color: '#dc2626' }}>{thumbnailError || error}</Typography>
              </Box>
            )}
          </Box>

          <TextField
            label='Title *'
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            fullWidth
            sx={fieldSx}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label='Price *'
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              fullWidth
              placeholder='e.g. 100000'
              sx={fieldSx}
            />
            <TextField
              select
              label='Status'
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              fullWidth
              sx={fieldSx}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.875rem' }}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            select
            label='Course Level'
            value={form.course_level ?? 'AllLevels'}
            onChange={(e) => set('course_level', e.target.value)}
            fullWidth
            sx={fieldSx}
          >
            {COURSE_LEVEL_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.875rem' }}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label='Short Description'
            value={form.short_description}
            onChange={(e) => set('short_description', e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={fieldSx}
          />

          <TextField
            label='Long Description'
            value={form.long_description}
            onChange={(e) => set('long_description', e.target.value)}
            fullWidth
            multiline
            rows={8}
            placeholder='Write in Markdown, like a README...'
            sx={fieldSx}
          />

          <Box sx={{ border: '1px solid #e2e8f0', bgcolor: '#f8fafc', borderRadius: '10px', px: 2, py: 1.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', mb: 0.5 }}>Preview</Typography>

            <Box
              sx={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                bgcolor: '#fff',
                px: 2,
                py: 1.5,
                minHeight: 160,
                maxHeight: 360,
                overflow: 'auto'
              }}
            >
              {form.long_description?.trim() ? (
                <SafeHtml html={form.long_description} />
              ) : (
                <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Preview will appear here as you type.
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
            border: '1.5px solid #e2e8f0',
            px: 2.5,
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isBusy || !form.title || !form.price}
          variant='contained'
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            backgroundColor: '#2563eb',
            px: 2.5,
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#1d4ed8' },
            '&:disabled': { backgroundColor: '#e2e8f0', color: '#94a3b8' }
          }}
        >
          {isBusy ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : isEdit ? 'Save Changes' : 'Create Course'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
