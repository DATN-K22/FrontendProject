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
        icon: <SchoolIcon sx={{ fontSize: 40 }} />,
        bgColor: '#D4F1F4',
        iconColor: '#4DB8C4'
      },
      {
        id: 2,
        title: CourseLevel.Intermediate,
        icon: <DesignServicesIcon sx={{ fontSize: 40 }} />,
        bgColor: '#D4DEF4',
        iconColor: '#5B7BC4'
      },
      {
        id: 3,
        title: CourseLevel.Advanced,
        icon: <ComputerIcon sx={{ fontSize: 40 }} />,
        bgColor: '#D4E8F4',
        iconColor: '#5BA5C4'
      },
      {
        id: 4,
        title: CourseLevel.Expert,
        icon: <StorageIcon sx={{ fontSize: 40 }} />,
        bgColor: '#FFE8D6',
        iconColor: '#FF8C42'
      },
      {
        id: 5,
        title: CourseLevel.AllLevels,
        icon: <WorkIcon sx={{ fontSize: 40 }} />,
        bgColor: '#B8F2E6',
        iconColor: '#3DB69A'
      }
    ],
    []
  )

  return (
    <Box
      sx={{
        py: { xs: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 6 },
        minHeight: '60vh',
        bgcolor: '#FAF9F4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}
      >
        <Typography
          variant='h4'
          sx={{
            fontWeight: 600,
            color: '#1a1a1a'
          }}
        >
          Choice favourite course from top category
        </Typography>
        <Typography
          sx={{
            color: '#FFD600',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          View All
        </Typography>
      </Box>

      {/* Cards Grid - 5 items per row */}
      <Grid container spacing={3}>
        {categories.map((category, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={category.id}>
            <Card
              ref={setItemRef(idx)}
              onClick={() => router.push(`/search?levels=${encodeURIComponent(category.title)}`)}
              sx={{
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: `transform ${durationMs}ms ${easing}, opacity 240ms linear, box-shadow 0.3s ease`,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  transitionDelay: '0ms'
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
                {/* Icon Box */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '12px',
                    backgroundColor: category.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    color: category.iconColor,
                    overflow: 'hidden'
                  }}
                >
                  {category.icon}
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                    fontSize: '1.125rem'
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
  )
}
