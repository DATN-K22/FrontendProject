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

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
]

interface ChapterModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  editingChapter?: any | null
  loading?: boolean
  error?: string | null
}

const EMPTY = { title: '', status: 'draft' }

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

export default function ChapterModal({ open, onClose, onSubmit, editingChapter, loading, error }: ChapterModalProps) {
  const isEdit = !!editingChapter
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (editingChapter) setForm(editingChapter)
    else setForm(EMPTY)
  }, [editingChapter, open])

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }))

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 0 } }}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
          {isEdit ? 'Edit Chapter' : 'Add New Chapter'}
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
          onClick={() => onSubmit(form)}
          disabled={loading || !form.title}
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
          {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : isEdit ? 'Save Changes' : 'Create Chapter'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
