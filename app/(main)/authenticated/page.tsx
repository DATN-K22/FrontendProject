'use client'

import api from '@/api/api'
import { Avatar, Box, Card, CardContent, Container, Grid, Skeleton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAlert } from '@/components/Alert'
import { ApiResponse } from '@/utils/dto/ApiResponse'
import { CourseLevel } from '@/components/CoursesWithGeneralInfo'
import { authUtils } from '@/utils/auth'
import CoursesWithProgress, { RelearningCourse } from '@/components/CoursesWithProgress'
import CoursesWithGeneralInfo, { RecommendedCourse } from '@/components/CoursesWithGeneralInfo'
import LearnAideHeroSection from '@/components/HeroSection'
import CourseCategories from '@/components/CourseCategories'
import FeatureDisplay from '@/components/FeatureDisplay'

export default function HomePage() {
  const [reLearningCourse, setRelearningCourse] = useState<RelearningCourse[] | null>(null)

  const [recommendationCourse, setRecommendationCourse] = useState<RecommendedCourse[] | null>(null)

  const [loading, setLoading] = useState(false)
  const { showAlert } = useAlert()
  const { userData } = authUtils.getAuth()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        if (userData) {
          const [incompleteCourses, recommendationCourses] = await Promise.all([
            api.get(`/courses/course/me/${userData.id}/latest-incomplete?limit=3`),
            api.get('/courses/course/recommendation?offset=0&limit=8')
          ])
          setRelearningCourse(incompleteCourses.data.data)
          setRecommendationCourse(recommendationCourses.data.data)
        } else {
          const recommendationCourses = await api.get('/courses/course/recommendation?offset=0&limit=8')
          setRecommendationCourse(recommendationCourses.data.data)
        }
      } catch (error) {
        console.log('Error fetching relearning course:', error)
        showAlert('Fail to fetch content for homepage')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  return (
    <Box>
      {reLearningCourse && reLearningCourse.length > 0 && (
        <CoursesWithProgress loading={loading} reLearningCourse={reLearningCourse} />
      )}

      <CourseCategories />
      <Box
        sx={{
          minHeight: '100vh',
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
