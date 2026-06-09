'use client'

import api from '@/api/api'
import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAlert } from '@/components/Alert'
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
  const router = useRouter()

  useEffect(() => {
    if (userData) {
      router.replace('/authenticated')
    }
  }, [userData, router])

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

  if (userData) return null

  return (
    <Box>
      <LearnAideHeroSection />
      {reLearningCourse && reLearningCourse.length > 0 && (
        <CoursesWithProgress loading={loading} reLearningCourse={reLearningCourse} />
      )}
      (
      <>
        <FeatureDisplay
          title='Learn Cloud Computing Step by Step'
          description='Build strong cloud fundamentals through structured video lessons designed for beginners and advanced learners. Practice your understanding instantly with interactive quizzes after each lesson to reinforce concepts and track your progress.'
          imageSrc='/images/video-learning.png'
          imageAlt='LearnAide Platform'
          direction='left'
          imagePosition='left'
        />

        <FeatureDisplay
          title='Practice on Real AWS Environments'
          description='Move beyond theory by deploying and managing real cloud infrastructure inside secure AWS sandbox environments.
Gain practical experience with modern cloud services used by real companies and engineering teams.'
          imageSrc='/images/lab.png'
          imageAlt='LearnAide Platform'
          direction='right'
          imagePosition='right'
        />

        <FeatureDisplay
          title='Learn Faster with an AI-Powered Assistant'
          description='Get instant support from an intelligent AI chatbot that helps answer course questions, explains technical concepts, and assists with troubleshooting.
Automatically generate personalized study schedules based on your learning goals and available time.'
          imageSrc='/images/chat.png'
          imageAlt='LearnAide Platform'
          direction='left'
          imagePosition='left'
        />
      </>
      )
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
