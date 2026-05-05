'use client'
import { Box, Typography, Paper, Avatar, Divider, Switch } from '@mui/material'
import { useState } from 'react'

const settingSections = [
  {
    title: 'Notifications',
    items: [
      { label: 'New learner enrollment', sub: 'Get notified when a learner joins your course', default: true },
      { label: 'Course reviews', sub: 'Get notified when a learner leaves a review', default: true },
      { label: 'Forum questions', sub: 'Get notified when someone posts a question', default: false },
      { label: 'Payment received', sub: 'Get notified on each new payment', default: true }
    ]
  },
  {
    title: 'Privacy',
    items: [
      { label: 'Show profile publicly', sub: 'Allow learners to view your instructor profile', default: true },
      { label: 'Show course analytics', sub: 'Display public stats on your course pages', default: false }
    ]
  }
]

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    settingSections.forEach((s) =>
      s.items.forEach((item) => {
        init[item.label] = item.default
      })
    )
    return init
  })

  return (
    <Box sx={{ p: '28px 32px' }}>
      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#111827', letterSpacing: '-0.02em', mb: 3 }}>
        Settings
      </Typography>

      {/* Profile card */}
      <Paper
        elevation={0}
        sx={{ border: '1.5px solid #e8edf2', borderRadius: '14px', p: '24px', backgroundColor: '#fff', mb: 3 }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', mb: 2 }}>Profile</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, backgroundColor: '#111827', fontSize: '1.2rem', fontWeight: 700 }}>
            T
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#111827' }}>Tuan</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8' }}>tuan@gmail.com</Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#2563eb',
                mt: 0.5,
                cursor: 'pointer',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Edit profile →
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Toggle sections */}
      {settingSections.map((section, si) => (
        <Paper
          key={si}
          elevation={0}
          sx={{ border: '1.5px solid #e8edf2', borderRadius: '14px', p: '24px', backgroundColor: '#fff', mb: 3 }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', mb: 2 }}>
            {section.title}
          </Typography>
          {section.items.map((item, ii) => (
            <Box key={ii}>
              {ii > 0 && <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mt: 0.3 }}>{item.sub}</Typography>
                </Box>
                <Switch
                  checked={toggles[item.label]}
                  onChange={() => setToggles((t) => ({ ...t, [item.label]: !t[item.label] }))}
                  size='small'
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563eb' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2563eb' }
                  }}
                />
              </Box>
            </Box>
          ))}
        </Paper>
      ))}
    </Box>
  )
}
