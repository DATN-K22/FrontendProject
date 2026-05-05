'use client'
import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Divider,
  ListItemButton,
  Button
} from '@mui/material'
import { ExpandMore, Lock, CheckCircle, VideoLibrary, AccessTime, AttachFile, Description } from '@mui/icons-material'
import { Chapter } from '@/utils/dto/Chapter'
import { useEffect, useState } from 'react'
import api from '@/api/api'
import { useParams } from 'next/navigation'
import { useAlert } from '@/components/alert'
import { LessonDetail as Lesson, LessonGeneral } from '@/utils/dto/Lesson'
import { useRouter } from 'next/navigation'
import { useVideoProgress } from '@/app/authenticated/(user)/course/[course_id]/(lesson)/layout'
import { getLessonIcon } from '@/app/authenticated/(user)/course/[course_id]/page'

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

function chapterTotalDuration(lessons: LessonGeneral[]): number {
  return lessons.reduce((acc, l) => acc + (l.duration ?? 0), 0)
}

function countFinished(lessons: LessonGeneral[]): number {
  return lessons.filter((l) => l.isFinished).length
}

function totalLessons(chapters: Chapter[]): number {
  return chapters.reduce((acc, c) => acc + c.lessons.length, 0)
}

function totalFinished(chapters: Chapter[]): number {
  return chapters.reduce((acc, c) => acc + countFinished(c.lessons), 0)
}

export type CourseChaptersResponse = {
  course: {
    id: string
    title: string
  }
  chapters: Chapter[]
  progress: number
}

export default function CourseTOC() {
  const { course_id, lesson_id } = useParams()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CourseChaptersResponse | null>(null)
  const [expanded, setExpanded] = useState<string>('')
  const { showAlert } = useAlert()
  const router = useRouter()
  const { tocVersion } = useVideoProgress()
  const fetchChapterLesson = async () => {
    try {
      setLoading(true)
      const courseResponse = await api.get(`/courses/chapters/TOC?course_id=${course_id}`)
      const responseData: CourseChaptersResponse = courseResponse.data.data
      setData(responseData)

      const activeChapter = responseData.chapters?.find((chapter) => chapter.lessons.some((l) => l.id === lesson_id))
      if (activeChapter) setExpanded(activeChapter.id)
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

  useEffect(() => {
    fetchChapterLesson()
  }, [])

  useEffect(() => {
    fetchChapterLesson()
  }, [tocVersion])
  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : '')
  }
  const chapters = data?.chapters ?? []
  const courseProgress = data?.progress ?? 0
  const finished = totalFinished(chapters)
  const total = totalLessons(chapters)
  return (
    <Box
      sx={{
        width: 380,
        flexShrink: 0
      }}
    >
      <Box
        sx={{
          background: 'white',
          borderRadius: '20px',
          p: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
      >
        <Button
          onClick={() => router.push(`/authenticated/course/${course_id}`)}
          sx={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}
        >
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              mb: 2,
              fontFamily: "'Poppins', sans-serif",
              color: '#1a1a1a'
            }}
          >
            {data?.course.title}
          </Typography>
        </Button>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {loading ? (
            <Skeleton width='100%' height={20} />
          ) : (
            <>
              <Typography
                variant='body2'
                sx={{
                  color: '#ffd700',
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: 'nowrap'
                }}
              >
                {finished}/{total} COMPLETED
              </Typography>
              <LinearProgress
                variant='determinate'
                value={courseProgress}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#f5f5f5',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ffd700',
                    borderRadius: 3
                  }
                }}
              />
            </>
          )}
        </Box>

        {/* Chapter Accordions */}
        <Box>
          {loading
            ? [1, 2, 3].map((i) => <Skeleton key={i} height={64} sx={{ borderRadius: '12px', mb: 1 }} />)
            : chapters.map((chapter) => {
                const isActive = chapter.id === expanded
                const chapterFinished = countFinished(chapter.lessons)
                const chapterTotal = chapter.lessons.length
                const chapterDuration = chapterTotalDuration(chapter.lessons)

                return (
                  <Accordion
                    key={chapter.id}
                    disableGutters
                    elevation={0}
                    expanded={isActive}
                    onChange={handleAccordionChange(chapter.id)}
                    sx={{
                      mb: 1,
                      '&:before': { display: 'none' },
                      borderRadius: '12px !important',
                      overflow: 'hidden',
                      border: isActive ? '2px solid #ffd700' : '2px solid transparent',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: isActive ? '#ffd700' : '#999' }} />}
                      sx={{
                        backgroundColor: isActive ? '#fffef0' : '#fafafa',
                        borderRadius: isActive ? '12px 12px 0 0' : '12px'
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontFamily: "'Inter', sans-serif",
                            mb: 0.5,
                            color: isActive ? '#ffd700' : '#333'
                          }}
                        >
                          {chapter.title}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <AccessTime sx={{ fontSize: 14, color: '#999' }} />
                            <Typography
                              variant='caption'
                              sx={{
                                color: '#999',
                                fontFamily: "'Inter', sans-serif"
                              }}
                            >
                              {formatDuration(chapterDuration)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <VideoLibrary sx={{ fontSize: 14, color: '#999' }} />
                            <Typography
                              variant='caption'
                              sx={{
                                color: '#999',
                                fontFamily: "'Inter', sans-serif"
                              }}
                            >
                              {chapterFinished}/{chapterTotal} Lessons
                            </Typography>
                          </Box>
                        </Box>
                        {/* Chapter progress bar */}
                        <LinearProgress
                          variant='determinate'
                          value={chapter.progress ?? 0}
                          sx={{
                            mt: 0.5,
                            height: 3,
                            borderRadius: 2,
                            backgroundColor: 'rgba(0,0,0,0.08)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: '#ffd700'
                            }
                          }}
                        />
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ p: 0, backgroundColor: '#fffef0' }}>
                      <List sx={{ p: 0 }}>
                        {chapter.lessons.map((lessonItem, idx) => {
                          const isCurrent = lessonItem.id === lesson_id
                          const isLocked = lessonItem.status === 'locked' || lessonItem.status === 'draft'

                          return (
                            <ListItem
                              key={lessonItem.id}
                              disablePadding
                              sx={{
                                borderBottom: '1px solid rgba(0,0,0,0.05)'
                              }}
                            >
                              <ListItemButton
                                disabled={isLocked}
                                selected={isCurrent}
                                onClick={() => {
                                  router.push(`/authenticated/course/${course_id}/${lessonItem.id}`)
                                }}
                                sx={{
                                  py: 1.5,
                                  px: 2,
                                  '&.Mui-selected': {
                                    bgcolor: '#fff'
                                  },
                                  '&.Mui-selected:hover': {
                                    bgcolor: '#fff'
                                  },
                                  '&:hover': {
                                    bgcolor: 'rgba(255,215,0,0.05)'
                                  }
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        minWidth: 0
                                      }}
                                    >
                                      <Box sx={{ flexShrink: 0 }}>{getLessonIcon(lessonItem.type)}</Box>

                                      {/* Title */}
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          fontFamily: "'Inter', sans-serif",
                                          color: isCurrent ? '#ffd700' : isLocked ? '#bbb' : '#555',
                                          fontWeight: isCurrent ? 600 : 400,

                                          flex: 1,
                                          minWidth: 0,

                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                      >
                                        {lessonItem.title}
                                      </Typography>

                                      {/* Icon phải */}
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 0.5,
                                          flexShrink: 0
                                        }}
                                      >
                                        {lessonItem.isFinished ? (
                                          <CheckCircle
                                            sx={{
                                              fontSize: 16,
                                              color: '#66bb6a'
                                            }}
                                          />
                                        ) : isLocked ? (
                                          <Lock sx={{ fontSize: 16, color: '#ccc' }} />
                                        ) : null}
                                      </Box>
                                    </Box>
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                          )
                        })}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )
              })}
        </Box>
      </Box>
    </Box>
  )
}
