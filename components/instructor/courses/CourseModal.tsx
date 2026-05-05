'use client'
import { useState, useEffect } from 'react'
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
  CircularProgress
} from '@mui/material'
import { X } from 'lucide-react'
import type { CreateCourseDto, UpdateCourseDto } from '@/api/courses/types'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
]

interface CourseModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateCourseDto | UpdateCourseDto) => Promise<void>
  editingCourse?: CreateCourseDto | UpdateCourseDto | null // if set → edit mode
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
  status: 'draft'
}

export default function CourseModal({ open, onClose, onSubmit, editingCourse, loading, error }: CourseModalProps) {
  const isEdit = !!editingCourse
  const [form, setForm] = useState<CreateCourseDto>(EMPTY)

  // Populate form when editing
  useEffect(() => {
    if (editingCourse) {
      setForm({
        owner_id: editingCourse.owner_id ?? '',
        title: editingCourse.title ?? '',
        short_description: editingCourse.short_description ?? '',
        long_description: editingCourse.long_description ?? '',
        thumbnail_url: editingCourse.thumbnail_url ?? '',
        price: editingCourse.price ?? '',
        status: (editingCourse.status as CreateCourseDto['status']) ?? 'draft'
      })
    } else {
      setForm(EMPTY)
    }
  }, [editingCourse, open])

  function set(field: keyof CreateCourseDto, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    await onSubmit(form)
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
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.875rem' }}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

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
            rows={4}
            sx={fieldSx}
          />

          <TextField
            label='Thumbnail URL'
            value={form.thumbnail_url}
            onChange={(e) => set('thumbnail_url', e.target.value)}
            fullWidth
            placeholder='https://...'
            sx={fieldSx}
          />

          {!isEdit && (
            <TextField
              label='Owner ID *'
              value={form.owner_id}
              onChange={(e) => set('owner_id', e.target.value)}
              fullWidth
              sx={fieldSx}
            />
          )}

          {error && (
            <Box sx={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', px: 2, py: 1.5 }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#dc2626' }}>{error}</Typography>
            </Box>
          )}
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
          disabled={loading || !form.title || !form.price}
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
          {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : isEdit ? 'Save Changes' : 'Create Course'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
