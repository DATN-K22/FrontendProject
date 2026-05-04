'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, CircularProgress } from '@mui/material'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

const VARIANT_CONFIG = {
  danger: {
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    confirmBg: '#dc2626',
    confirmHover: '#b91c1c'
  },
  warning: {
    iconColor: '#d97706',
    iconBg: '#fffbeb',
    confirmBg: '#d97706',
    confirmHover: '#b45309'
  },
  info: {
    iconColor: '#2563eb',
    iconBg: '#eff6ff',
    confirmBg: '#2563eb',
    confirmHover: '#1d4ed8'
  }
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false
}: ConfirmProps) {
  const config = VARIANT_CONFIG[variant]

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', p: 0 } }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>{title}</Typography>
        <Box
          onClick={loading ? undefined : onClose}
          sx={{
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#94a3b8',
            display: 'flex',
            opacity: loading ? 0.4 : 1,
            '&:hover': { color: loading ? '#94a3b8' : '#111827' }
          }}
        >
          <X size={20} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 0 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', py: 1 }}>
          <Box
            sx={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: config.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={20} color={config.iconColor} />
          </Box>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: '#475569',
              lineHeight: 1.6,
              pt: 0.5
            }}
          >
            {description}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
        <Box
          component='button'
          onClick={loading ? undefined : onClose}
          disabled={loading}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#64748b',
            border: '1.5px solid #e2e8f0',
            px: 2.5,
            py: 1,
            backgroundColor: 'transparent',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            '&:hover': { backgroundColor: loading ? 'transparent' : '#f8fafc' }
          }}
        >
          {cancelLabel}
        </Box>
        <Box
          component='button'
          onClick={loading ? undefined : onConfirm}
          disabled={loading}
          sx={{
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#fff',
            border: 'none',
            px: 2.5,
            py: 1,
            backgroundColor: config.confirmBg,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            opacity: loading ? 0.8 : 1,
            '&:hover': { backgroundColor: loading ? config.confirmBg : config.confirmHover }
          }}
        >
          {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : confirmLabel}
        </Box>
      </DialogActions>
    </Dialog>
  )
}
