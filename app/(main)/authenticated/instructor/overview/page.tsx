'use client'
import { Box, Typography, Grid, Paper } from '@mui/material'
import { TrendingUp, Users, BookOpen, Star } from 'lucide-react'

const stats = [
  { label: 'Total Revenue', value: '$12,430', change: '+12%', icon: <TrendingUp size={20} />, color: '#2563eb' },
  { label: 'Total Learners', value: '1,284', change: '+8%', icon: <Users size={20} />, color: '#16a34a' },
  { label: 'Active Courses', value: '6', change: '+1', icon: <BookOpen size={20} />, color: '#9333ea' },
  { label: 'Avg. Rating', value: '4.8', change: '+0.2', icon: <Star size={20} />, color: '#ea580c' }
]

export default function OverviewPage() {
  return (
    <Box sx={{ p: '28px 32px' }}>
      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#111827', letterSpacing: '-0.02em', mb: 3 }}>
        Overview
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper
              elevation={0}
              sx={{
                border: '1.5px solid #e8edf2',
                borderRadius: '14px',
                p: '20px 22px',
                backgroundColor: '#fff',
                cursor: 'default',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: '0 8px 28px rgba(0,0,0,0.09)', transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>{s.label}</Typography>
                <Box
                  sx={{ color: s.color, backgroundColor: `${s.color}14`, borderRadius: '8px', p: 0.8, display: 'flex' }}
                >
                  {s.icon}
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#111827', lineHeight: 1 }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#16a34a', mt: 0.5, fontWeight: 600 }}>
                {s.change} this month
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{ border: '1.5px solid #e8edf2', borderRadius: '14px', p: '24px', backgroundColor: '#fff' }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827', mb: 1 }}>Recent Activity</Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8' }}>Activity feed will appear here.</Typography>
      </Paper>
    </Box>
  )
}
