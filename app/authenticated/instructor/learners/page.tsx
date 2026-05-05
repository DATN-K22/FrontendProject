'use client'
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material'

const learners = [
  {
    id: 1,
    name: 'Alice Nguyen',
    email: 'alice@email.com',
    course: "Beginner's Guide to Design",
    progress: 80,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Bob Tran',
    email: 'bob@email.com',
    course: 'Advanced UI/UX Patterns',
    progress: 45,
    status: 'Active'
  },
  { id: 3, name: 'Carol Le', email: 'carol@email.com', course: 'Mastering Figma', progress: 100, status: 'Completed' },
  {
    id: 4,
    name: 'David Pham',
    email: 'david@email.com',
    course: 'Design Systems at Scale',
    progress: 20,
    status: 'Inactive'
  },
  {
    id: 5,
    name: 'Eva Hoang',
    email: 'eva@email.com',
    course: "Beginner's Guide to Design",
    progress: 60,
    status: 'Active'
  }
]

const statusColor: Record<string, { bg: string; color: string }> = {
  Active: { bg: '#f0fdf4', color: '#16a34a' },
  Completed: { bg: '#eff6ff', color: '#2563eb' },
  Inactive: { bg: '#fef2f2', color: '#dc2626' }
}

export default function LearnersPage() {
  return (
    <Box sx={{ p: '28px 32px' }}>
      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#111827', letterSpacing: '-0.02em', mb: 3 }}>
        Learners
      </Typography>

      <Paper
        elevation={0}
        sx={{ border: '1.5px solid #e8edf2', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#fff' }}
      >
        {/* Table header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr',
            px: 3,
            py: 1.5,
            backgroundColor: '#f8fafc',
            borderBottom: '1.5px solid #e8edf2'
          }}
        >
          {['Learner', 'Course', 'Progress', 'Status'].map((h) => (
            <Typography
              key={h}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {/* Rows */}
        {learners.map((l, i) => {
          const sc = statusColor[l.status]
          return (
            <Box
              key={l.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr 1fr',
                px: 3,
                py: 2,
                alignItems: 'center',
                borderBottom: i < learners.length - 1 ? '1px solid #f1f5f9' : 'none',
                '&:hover': { backgroundColor: '#f8fafc' },
                transition: 'background-color 0.15s'
              }}
            >
              {/* Name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  {l.name[0]}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{l.name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{l.email}</Typography>
                </Box>
              </Box>
              {/* Course */}
              <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>{l.course}</Typography>
              {/* Progress */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 99 }}>
                    <Box
                      sx={{ width: `${l.progress}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: 99 }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, minWidth: 30 }}>
                    {l.progress}%
                  </Typography>
                </Box>
              </Box>
              {/* Status */}
              <Chip
                label={l.status}
                size='small'
                sx={{
                  backgroundColor: sc.bg,
                  color: sc.color,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  border: `1px solid ${sc.color}22`,
                  height: 24
                }}
              />
            </Box>
          )
        })}
      </Paper>
    </Box>
  )
}
