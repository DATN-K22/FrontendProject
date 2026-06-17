'use client'

import { useMemo } from 'react'
import DesignServicesIcon from '@mui/icons-material/DesignServices'
import ComputerIcon from '@mui/icons-material/Computer'
import StorageIcon from '@mui/icons-material/Storage'
import WorkIcon from '@mui/icons-material/Work'
import { CourseLevel } from './CoursesWithGeneralInfo'
import SchoolIcon from '@mui/icons-material/School'
import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useScrollRevealList } from '@/hooks/useScrollRevealList'

export default function CourseCategories() {
  const router = useRouter()
  const { setItemRef, getItemStyle, durationMs, easing } = useScrollRevealList({
    direction: 'alternate'
  })

  const categories = useMemo(
    () => [
      {
        id: 1,
        title: CourseLevel.Beginner,
        icon: <SchoolIcon sx={{ fontSize: 36 }} />,
        bgColor: 'rgba(56, 211, 183, 0.15)',
        iconColor: '#38D3B7',
        accentColor: '#38D3B7'
      },
      {
        id: 2,
        title: CourseLevel.Intermediate,
        icon: <DesignServicesIcon sx={{ fontSize: 36 }} />,
        bgColor: 'rgba(99, 140, 255, 0.15)',
        iconColor: '#638CFF',
        accentColor: '#638CFF'
      },
      {
        id: 3,
        title: CourseLevel.Advanced,
        icon: <ComputerIcon sx={{ fontSize: 36 }} />,
        bgColor: 'rgba(255, 214, 0, 0.12)',
        iconColor: '#FFD600',
        accentColor: '#FFD600'
      },
      {
        id: 4,
        title: CourseLevel.Expert,
        icon: <StorageIcon sx={{ fontSize: 36 }} />,
        bgColor: 'rgba(255, 107, 107, 0.15)',
        iconColor: '#FF6B6B',
        accentColor: '#FF6B6B'
      },
      {
        id: 5,
        title: CourseLevel.AllLevels,
        icon: <WorkIcon sx={{ fontSize: 36 }} />,
        bgColor: 'rgba(179, 102, 255, 0.15)',
        iconColor: '#B366FF',
        accentColor: '#B366FF'
      }
    ],
    []
  )

  return (
    <Box
      sx={{
        minHeight: '60vh',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <Box
        sx={{
          bgcolor: '#252641',
          borderRadius: '32px',
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 6 },

          boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 5,
            position: 'relative'
          }}
        >
          <Box>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2
              }}
            >
              Choose your favourite course
              <Box
                component='span'
                sx={{
                  color: '#FFD600',
                  display: 'block'
                }}
              >
                from top category
              </Box>
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          {categories.map((category, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={category.id}>
              <Card
                ref={setItemRef(idx)}
                onClick={() => router.push(`/search?levels=${encodeURIComponent(category.title)}`)}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'none',
                  backdropFilter: 'blur(8px)',
                  transition: `transform ${durationMs}ms ${easing}, opacity 240ms linear, border-color 0.25s ease, box-shadow 0.25s ease`,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%) scaleX(0)',
                    width: '60%',
                    height: '2px',
                    bgcolor: category.accentColor,
                    borderRadius: '2px 2px 0 0',
                    transition: 'transform 0.25s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: `${category.accentColor}55`,
                    boxShadow: `0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px ${category.accentColor}22`,
                    transitionDelay: '0ms',
                    '&::after': {
                      transform: 'translateX(-50%) scaleX(1)'
                    }
                  },
                  ...getItemStyle(idx)
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '16px',
                      backgroundColor: category.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                      color: category.iconColor,
                      border: `1px solid ${category.accentColor}30`,
                      transition: 'transform 0.25s ease',
                      '.MuiCard-root:hover &': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {category.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: '#e8e8f4',
                      fontSize: '1rem',
                      transition: 'color 0.25s ease',
                      '.MuiCard-root:hover &': {
                        color: category.accentColor
                      }
                    }}
                  >
                    {category.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
