'use client'

import api from '@/api/api'
import { Avatar, Box, Card, CardContent, Container, Grid, Skeleton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import DesignServicesIcon from '@mui/icons-material/DesignServices'
import ComputerIcon from '@mui/icons-material/Computer'
import StorageIcon from '@mui/icons-material/Storage'
import WorkIcon from '@mui/icons-material/Work'
import SchoolIcon from '@mui/icons-material/School'
import StarIcon from '@mui/icons-material/Star'
import { useRouter } from 'next/navigation'
import { useAlert } from '@/components/alert'
import { ApiResponse } from '@/utils/dto/ApiResponse'
import { CourseLevel } from '@/components/coursesWithGeneralInfo'
import { authUtils } from '@/utils/auth'
import CoursesWithProgress, { RelearningCourse } from '@/components/coursesWithProgress'
import CoursesWithGeneralInfo, { RecommendedCourse } from '@/components/coursesWithGeneralInfo'

/*=== Define type ===*/

export default function HomePage() {
  /*=== UseState hooks ===*/
  const [reLearningCourse, setRelearningCourse] = useState<RelearningCourse[] | null>(null)

  const [recommendationCourse, setRecommendationCourse] = useState<RecommendedCourse[] | null>(null)

  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { showAlert } = useAlert()
  const { userData } = authUtils.getAuth()
  /*=== UseEffect hooks ===*/
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const incompleteCourses = await api.get(`/courses/course/me/${userData.id}/latest-incomplete?limit=3`)
        const recommendationCourses: { data: { data: RecommendedCourse[] } } = await api.get(
          '/courses/course/me/recommendation?offset=0&limit=8'
        )
        setRelearningCourse(incompleteCourses.data.data)
        setRecommendationCourse(recommendationCourses.data.data)
      } catch (error) {
        console.log('Error fetching relearning course:', error)
        showAlert('Fail to fetch content for homepage')
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  const CourseCategories = () => {
    const categories = [
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
    ]

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
          {categories.map((category) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={category.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
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
                      borderRadius: 2,
                      backgroundColor: category.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      color: category.iconColor
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

  return (
    <Box>
      {reLearningCourse && reLearningCourse.length > 0 && (
        <CoursesWithProgress loading={loading} reLearningCourse={reLearningCourse} />
      )}
      <CourseCategories />

      <Box
        sx={{
          minHeight: '100vh',
          background: '#FAF9F4',
          py: { xs: 4, md: 5 },
          px: { xs: 2, sm: 3, md: 6 }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4
          }}
        >
          <Typography
            variant='h4'
            sx={{
              fontWeight: 600,
              color: '#000000'
            }}
          >
            Recommended for you
          </Typography>
          <Typography
            component='a'
            href='#'
            sx={{
              color: '#FFD600',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            See all
          </Typography>
        </Box>
        <CoursesWithGeneralInfo loading={loading} courses={recommendationCourse} />
      </Box>
    </Box>
  )
}
