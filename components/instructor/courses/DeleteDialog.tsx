'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress
} from '@mui/material'
import { AlertTriangle } from 'lucide-react'

interface DeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  courseName?: string
}

export default function DeleteDialog({ open, onClose, onConfirm, loading, courseName }: DeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ backgroundColor: '#fef2f2', borderRadius: '10px', p: 1, display: 'flex' }}>
            <AlertTriangle size={20} color='#dc2626' />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Delete Course</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Typography sx={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
          Are you sure you want to delete <span style={{ fontWeight: 600, color: '#111827' }}>"{courseName}"</span>?
          This action cannot be undone.
        </Typography>
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
          onClick={onConfirm}
          disabled={loading}
          variant='contained'
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            backgroundColor: '#dc2626',
            px: 2.5,
            boxShadow: 'none',
            '&:hover': { backgroundColor: '#b91c1c' }
          }}
        >
          {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
