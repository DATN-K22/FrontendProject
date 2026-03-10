'use client'
import { mockCourses } from '@/components/instructor/Mockdata'
import type { Course } from '@/components/instructor/types'
import { Box, Button, Grid, IconButton, Typography } from '@mui/material'
import { MoreHorizontal, Plus } from 'lucide-react'

const badgeStyle: Record<Course['badge'], { bg: string; color: string }> = {
  Free: { bg: '#f1f5f9', color: '#475569' },
  Paid: { bg: '#eff6ff', color: '#2563eb' },
  Premium: { bg: '#fdf4ff', color: '#9333ea' }
}

function CourseCard({ course }: { course: Course }) {
  const b = badgeStyle[course.badge]
  const stats = [
    { value: `$${course.price.toFixed(2)}`, label: 'Price' },
    { value: course.chapters, label: 'Chapters' },
    { value: course.orders, label: 'Orders' },
    { value: course.certificates, label: 'Certificates' },
    { value: course.reviews, label: 'Reviews' },
    { value: course.addedToShelf, label: 'Added to Shelf' }
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
        '&:hover': { boxShadow: '0 8px 28px rgba(0,0,0,0.09)', transform: 'translateY(-2px)' }
      }}
    >
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
          backgroundColor: b.bg,
          color: b.color,
          border: `1px solid ${b.color}22`
        }}
      >
        {course.badge}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827', mb: 2, lineHeight: 1.35 }}>
        {course.title}
      </Typography>
      <Grid container columns={3} rowSpacing={1.5}>
        {stats.map((s) => (
          <Grid key={s.label} size={1}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>{s.value}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.2 }}>{s.label}</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default function CoursesPage() {
  return (
    <Box sx={{ p: '28px 32px' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#111827', letterSpacing: '-0.02em' }}>
          Courses
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant='contained'
            startIcon={<Plus size={16} />}
            sx={{
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              px: 2.5,
              py: 1.1,
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              '&:hover': { backgroundColor: '#1d4ed8' }
            }}
          >
            Add Course
          </Button>
          <IconButton
            sx={{
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              backgroundColor: '#fff',
              color: '#64748b',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
          >
            <MoreHorizontal size={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Grid */}
      <Grid container spacing={2.5}>
        {mockCourses.map((course) => (
          <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
