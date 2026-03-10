import React from 'react'
import { Box } from '@mui/material'
import InstructorSidebar from '@/components/instructor/Sidebar'

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <InstructorSidebar />
      <Box component='main' sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  )
}
