'use client'
import { useParams, useRouter } from 'next/navigation'
import { Box, Container, Typography, Tab, Tabs, List, ListItem, ListItemText, Skeleton, Button } from '@mui/material'
import { ExpandMore, Lock, CheckCircle, VideoLibrary, AccessTime, AttachFile, Description } from '@mui/icons-material'
import { useEffect, useRef, useState } from 'react'
import api from '@/api/api'
import { useAlert } from '@/components/Alert'
import VideoPlayer from '@/components/VideoPlayer'
import { useVideoProgress } from '../layout'
import { authUtils } from '@/utils/auth'

// Define type theo API response thực tế
type ChapterItemDetail = {
  id: string
  title: string
  status: string
  type: 'lesson' | 'lab' | 'quiz'
  sort_order: number
  short_description: string
  long_description: string
  duration: number
  isFinished: boolean
  leaseTemplateId?: string // chỉ có lab mới có
  chapter: any
  resources?: {
    video: { link: string; title: string }[]
    document: { link: string; title: string }[]
  }
  // quiz only
  questions?: {
    id: string
    question_text: string
    questionType: string
    options: {
      id: string
      option_text: string
      is_correct: boolean
      description: string
      reason: string
    }[]
  }[]
}

export default function LessonDetail() {
  const { lesson_id, course_id } = useParams()
  const { userData } = authUtils.getAuth()
  const [tabValue, setTabValue] = useState(0)
  const { handleProgress90 } = useVideoProgress()
  const [data, setData] = useState<ChapterItemDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const { showAlert } = useAlert()
  const router = useRouter()

  useEffect(() => {
    const fetchChapterLesson = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/courses/lessons/${lesson_id}/${userData?.id}`)
        setData(response.data.data)
      } catch (error) {
        console.error('Error fetching course:', error)
        showAlert('Failed to fetch detail of the course', 'error', {
          vertical: 'bottom',
          horizontal: 'left'
        })
      } finally {
        setLoading(false)
      }
    }
    fetchChapterLesson()
  }, [lesson_id])

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth='xl'>
        {/* Header */}
        <Box
          sx={{
            background: 'white',
            borderRadius: '20px',
            p: 3,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <VideoLibrary sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            {loading || !data ? (
              <>
                <Skeleton width={200} height={28} />
                <Skeleton width={140} height={20} />
              </>
            ) : (
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 600,
                  color: '#1a1a1a',
                  mb: 0.5,
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                {data.type.charAt(0).toUpperCase() + data.type.slice(1)}: {data.title}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {loading || !data ? (
            <Skeleton variant='rectangular' width='100%' sx={{ aspectRatio: '16/9' }} />
          ) : (
            <>
              {/* Lesson — có video/description/resource tabs */}
              {data.type === 'lesson' && (
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ background: 'white', borderRadius: '20px 20px 0 0' }}>
                    <Tabs
                      value={tabValue}
                      onChange={(_, newValue) => setTabValue(newValue)}
                      sx={{
                        px: 2,
                        '& .MuiTab-root': {
                          textTransform: 'none',
                          fontSize: '16px',
                          fontWeight: 500,
                          fontFamily: "'Inter', sans-serif",
                          color: '#666',
                          '&.Mui-selected': {
                            color: '#ffd700',
                            fontWeight: 600
                          }
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#ffd700',
                          height: 3
                        }
                      }}
                    >
                      <Tab label='Tutorial Videos' />
                      <Tab label='Description' />
                      <Tab label='Resource' />
                    </Tabs>
                  </Box>

                  {/* Tab: Video */}
                  <Box
                    sx={{
                      display: tabValue === 0 ? 'block' : 'none',
                      background: 'white',
                      borderRadius: '0 0 20px 20px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        aspectRatio: '16/9',
                        background: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {!data.resources?.video?.length ? (
                        <Skeleton variant='rectangular' width='100%' height='100%' />
                      ) : (
                        <VideoPlayer
                          onProgress90={() => {
                            handleProgress90(lesson_id as string, course_id as string)
                          }}
                          isFinished={data.isFinished}
                          url={data.resources.video[0].link}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Tab: Description */}
                  <Box
                    sx={{
                      display: tabValue === 1 ? 'block' : 'none',
                      background: 'white',
                      borderRadius: '0 0 20px 20px',
                      p: 3,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 600,
                        fontFamily: "'Poppins', sans-serif",
                        mb: 1
                      }}
                    >
                      {data.title}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: '#555',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        mb: 1
                      }}
                    >
                      {data.short_description}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: '#777',
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: 1.8
                      }}
                    >
                      {data.long_description}
                    </Typography>
                  </Box>

                  {/* Tab: Resource */}
                  <Box
                    sx={{
                      display: tabValue === 2 ? 'block' : 'none',
                      background: 'white',
                      borderRadius: '0 0 20px 20px',
                      p: 3,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    {data.resources?.document?.length ? (
                      <List disablePadding>
                        {data.resources.document.map((resource, idx) => (
                          <ListItem
                            key={idx}
                            sx={{
                              px: 2,
                              py: 1.5,
                              mb: 1,
                              borderRadius: '10px',
                              border: '1px solid #f0f0f0',
                              '&:hover': { backgroundColor: '#fffef0' }
                            }}
                            component='a'
                            href={resource.link}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <AttachFile sx={{ color: '#ffd700', mr: 1.5, fontSize: 20 }} />
                            <ListItemText
                              primary={
                                <Typography
                                  variant='body2'
                                  sx={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: '#333',
                                    wordBreak: 'break-all'
                                  }}
                                >
                                  {resource.title}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          py: 6,
                          color: '#bbb'
                        }}
                      >
                        <Description sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant='body2' sx={{ fontFamily: "'Inter', sans-serif" }}>
                          No resources available for this lesson.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Lab hoặc Quiz — button navigate */}
              {(data.type === 'lab' || data.type === 'quiz') && (
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      background: 'white',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        aspectRatio: '16/9',
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Button
                        variant='contained'
                        size='large'
                        onClick={() => {
                          if (data.type === 'lab') {
                            router.push(
                              `/authenticated/course/${course_id}/${data.type}/${lesson_id}/${data.leaseTemplateId}/overview`
                            )
                          } else router.push(`/authenticated/course/${course_id}/${data.type}/${lesson_id}/overview`)
                        }}
                        sx={{
                          background: 'white',
                          color: '#ffd700',
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 600,
                          fontSize: '18px',
                          px: 6,
                          py: 2,
                          borderRadius: '12px',
                          textTransform: 'none',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                          '&:hover': {
                            background: '#fffef0',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                          }
                        }}
                      >
                        Take {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  )
}
