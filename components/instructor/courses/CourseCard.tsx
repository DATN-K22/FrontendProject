import { Box, Typography, Grid, IconButton, Tooltip } from '@mui/material'
import { Pencil, Trash2 } from 'lucide-react'
import type { CourseEntity } from '@/api/courses/types'

const statusStyle: Record<string, { bg: string; color: string }> = {
  draft: { bg: '#f1f5f9', color: '#475569' },
  published: { bg: '#f0fdf4', color: '#16a34a' },
  archived: { bg: '#fef2f2', color: '#dc2626' }
}

interface CourseCardProps {
  course: CourseEntity
  onEdit: (course: CourseEntity) => void
  onDelete: (id: string) => void
}

export default function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const s = statusStyle[course.status] ?? statusStyle.draft
  const price = parseFloat(course.price)

  const stats = [
    { value: isNaN(price) ? course.price : `$${price.toLocaleString()}`, label: 'Price' },
    { value: course.enrollments?.length ?? 0, label: 'Enrollments' }
  ]

  return (
    <Box
      sx={{
        border: '1.5px solid #e8edf2',
        borderRadius: '14px',
        p: '20px 22px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        position: 'relative',
        '&:hover': { boxShadow: '0 8px 28px rgba(0,0,0,0.09)', transform: 'translateY(-2px)' },
        '&:hover .card-actions': { opacity: 1 }
      }}
    >
      {/* Status badge */}
      <Box
        sx={{
          display: 'inline-block',
          px: 1.5,
          py: 0.4,
          borderRadius: '8px',
          mb: 1.5,
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          backgroundColor: s.bg,
          color: s.color,
          border: `1px solid ${s.color}22`,
          textTransform: 'capitalize'
        }}
      >
        {course.status}
      </Box>

      {/* Action buttons (shown on hover) */}
      <Box
        className='card-actions'
        sx={{
          position: 'absolute',
          top: 14,
          right: 14,
          display: 'flex',
          gap: 0.5,
          opacity: 0,
          transition: 'opacity 0.15s'
        }}
      >
        <Tooltip title='Edit' arrow>
          <IconButton
            size='small'
            onClick={(e) => {
              e.stopPropagation()
              onEdit(course)
            }}
            sx={{
              width: 28,
              height: 28,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              '&:hover': { backgroundColor: '#eff6ff', color: '#2563eb' }
            }}
          >
            <Pencil size={13} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Delete' arrow>
          <IconButton
            size='small'
            onClick={(e) => {
              e.stopPropagation()
              onDelete(course.id)
            }}
            sx={{
              width: 28,
              height: 28,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              '&:hover': { backgroundColor: '#fef2f2', color: '#dc2626' }
            }}
          >
            <Trash2 size={13} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Title */}
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827', mb: 1, lineHeight: 1.35, pr: 6 }}>
        {course.title}
      </Typography>

      {/* Short description */}
      {course.short_description && (
        <Typography
          sx={{
            fontSize: '0.8rem',
            color: '#94a3b8',
            mb: 2,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {course.short_description}
        </Typography>
      )}

      {/* Stats */}
      <Grid container columns={2} rowSpacing={1} sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
        {stats.map((s) => (
          <Grid key={s.label} size={1}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{s.value}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.2 }}>{s.label}</Typography>
          </Grid>
        ))}
      </Grid>

      {/* Created at */}
      <Typography sx={{ fontSize: '0.72rem', color: '#cbd5e1', mt: 1.5 }}>
        Created {new Date(course.created_at).toLocaleDateString('vi-VN')}
      </Typography>
    </Box>
  )
}
