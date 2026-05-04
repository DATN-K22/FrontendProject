'use client'

import api from '@/api/api'
import { useAlert } from '@/components/alert'
import { authUtils } from '@/utils/auth'
import QuizIcon from '@mui/icons-material/Quiz'
import { CheckCircle, Cancel, PlayCircle, Help, CalendarMonth } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  List,
  ListItem,
  Paper,
  Skeleton,
  Stack,
  Typography
} from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
type QuizOverview = {
  id: string
  title: string
  description: string | null
}

type QuizHistoryItem = {
  sessionId: string
  startedAt: string
  endedAt: string | null
  completed: boolean
  score: string
  skillEstimate: string
  correctAnswers?: number | null
  correctCount?: number | null
  numberCorrect?: number | null
  correct?: number | null
}

type QuizHistoryStatus = 'complete' | 'fail' | 'running' | 'unknown'

type QuizOverviewPayload = {
  quiz: QuizOverview
  history: QuizHistoryItem[]
}

type QuizOverviewApiResponse = {
  data: QuizOverviewPayload
}

const QUIZ_COLORS = {
  primary: '#FFD700',
  primarySoft: '#FFF9C4',
  primaryDeep: '#B8860B',
  background: '#FFFCF1',
  surface: 'rgba(255,255,255,0.96)',
  border: 'rgba(15, 23, 42, 0.08)',
  text: '#0f172a',
  muted: '#64748b',
  success: '#16a34a',
  danger: '#dc2626'
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? '')
}

function parseScore(score: string) {
  const [correctRaw, totalRaw] = score.split('/')
  const correct = Number(correctRaw)
  const total = Number(totalRaw)
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0) {
    return { percent: 0 }
  }
  return {
    percent: Math.round((correct / total) * 100)
  }
}

function formatDateTime(value: string | null) {
  if (!value) return 'In progress'
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getHistoryStatus(item: QuizHistoryItem): QuizHistoryStatus {
  if (!item.completed) return 'running'
  return parseScore(item.score).percent >= 50 ? 'complete' : 'fail'
}

function getStatusIcon(status: QuizHistoryStatus) {
  switch (status) {
    case 'running':
      return <PlayCircle sx={{ fontSize: 18, color: '#3b82f6' }} />
    case 'complete':
      return <CheckCircle sx={{ fontSize: 18, color: '#10b981' }} />
    case 'fail':
      return <Cancel sx={{ fontSize: 18, color: '#ef4444' }} />
    default:
      return <Help sx={{ fontSize: 18, color: '#9ca3af' }} />
  }
}

function getStatusColor(status: QuizHistoryStatus) {
  switch (status) {
    case 'complete':
      return 'success' as const
    case 'fail':
      return 'error' as const
    case 'running':
      return 'info' as const
    case 'unknown':
    default:
      return 'default' as const
  }
}

function getStatusLabel(status: QuizHistoryStatus) {
  switch (status) {
    case 'complete':
      return 'Complete'
    case 'fail':
      return 'Failed'
    case 'running':
      return 'Running'
    case 'unknown':
    default:
      return 'Unknown'
  }
}

function getCorrectAnswers(item: QuizHistoryItem) {
  const candidates = [item.correctAnswers, item.correctCount, item.numberCorrect, item.correct]

  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return value
    }
  }

  const [correctRaw] = (item.score ?? '').split('/')
  const parsed = Number(correctRaw)
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed
  }

  return null
}

export default function QuizOverview() {
  const params = useParams()
  const router = useRouter()
  const { showAlert } = useAlert()

  const courseId = getParam(params.course_id as string | string[] | undefined)
  const quizId = getParam(params.quiz_id as string | string[] | undefined)
  const user = authUtils.getAuth().userData

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quizData, setQuizData] = useState<QuizOverview | null>(null)
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([])

  const apiRoot = useMemo(() => {
    if (!user?.id || !quizId) return null
    return `/courses/quizzes/${user.id}/${quizId}?limit=5&offset=0`
  }, [quizId, user?.id])

  const loadQuizData = useCallback(async () => {
    if (!apiRoot) {
      setError('Missing quiz or user information.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.get(apiRoot)
      const payload = (response.data?.data ?? response.data) as QuizOverviewPayload
      setQuizData(payload.quiz)
      setQuizHistory(payload.history ?? [])
    } catch (requestError) {
      const message = 'Unable to load quiz information.'
      setError(message)
      showAlert(message, 'error', { vertical: 'bottom', horizontal: 'left' })
      console.error('Error fetching quiz data:', requestError)
    } finally {
      setLoading(false)
    }
  }, [apiRoot, showAlert])

  useEffect(() => {
    void loadQuizData()
  }, [loadQuizData])

  const activeAttempt = quizHistory.find((item) => !item.completed)
  const startLabel = activeAttempt ? 'Resume quiz' : 'Start quiz'

  const handleStartQuiz = () => {
    router.push(`/authenticated/course/${courseId}/quiz/${quizId}/start`)
  }

  const handleBack = () => {
    if (courseId) {
      router.push(`/authenticated/course/${courseId}`)
      return
    }
    router.back()
  }

  const accentChipSx = {
    backgroundColor: QUIZ_COLORS.primarySoft,
    color: QUIZ_COLORS.text,
    border: `1px solid ${QUIZ_COLORS.border}`,
    fontWeight: 700
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
          pb: 8,
          px: 4
        }}
      >
        <Container maxWidth='xl' sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Skeleton variant='text' width='65%' height={72} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '5fr 2fr' },
                gap: 3
              }}
            >
              <Stack spacing={3}>
                <Skeleton variant='rounded' height={170} sx={{ borderRadius: 5 }} />
                <Skeleton variant='rounded' height={260} sx={{ borderRadius: 5 }} />
              </Stack>
              <Skeleton variant='rounded' height={420} sx={{ borderRadius: 5 }} />
            </Box>
          </Stack>
        </Container>
      </Box>
    )
  }

  if (error && !quizData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
          pb: 8,
          px: 4
        }}
      >
        <Container maxWidth='md' sx={{ py: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 5,
              background: QUIZ_COLORS.surface,
              border: `1px solid ${QUIZ_COLORS.border}`,
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)'
            }}
          >
            <Stack spacing={2} alignItems='flex-start'>
              <Chip label='Quiz Overview' sx={accentChipSx} />
              <Typography variant='h4' sx={{ fontWeight: 800, color: QUIZ_COLORS.text }}>
                Unable to load quiz
              </Typography>
              <Typography sx={{ color: QUIZ_COLORS.muted }}>{error}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant='contained'
                  onClick={() => void loadQuizData()}
                  sx={{
                    backgroundColor: QUIZ_COLORS.primary,
                    color: QUIZ_COLORS.text,
                    fontWeight: 800,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#f0c800' }
                  }}
                >
                  Retry
                </Button>
                <Button
                  variant='outlined'
                  onClick={handleBack}
                  sx={{
                    borderColor: QUIZ_COLORS.primary,
                    color: QUIZ_COLORS.text,
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  Back
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
        pb: 8,
        px: 4
      }}
    >
      <Box sx={{ pt: 4, mb: 2 }}>
        <IconButton
          onClick={() => {
            router.push(`/authenticated/course/${courseId}/${quizId}`)
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Container maxWidth='xl'>
        <Stack spacing={3}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h3'
              component='h1'
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' }
              }}
            >
              {quizData?.title ?? 'Quiz'}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '5fr 2fr' },
              gap: 3
            }}
          >
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: QUIZ_COLORS.surface,
                  borderRadius: 5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: `1px solid ${QUIZ_COLORS.border}`
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        borderRadius: '50%',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                      }}
                    >
                      <QuizIcon sx={{ color: '#ffffff', fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant='body1' sx={{ fontWeight: 700 }}>
                        Revising chapter
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant='contained'
                    onClick={handleStartQuiz}
                    sx={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                      color: QUIZ_COLORS.text,
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    {startLabel}
                  </Button>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: 5,
                  p: 4,
                  border: `1px solid ${QUIZ_COLORS.border}`,
                  background: QUIZ_COLORS.surface,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
              >
                <Typography variant='h5' sx={{ fontWeight: 800, mb: 3, color: QUIZ_COLORS.text }}>
                  Quiz Overview
                </Typography>
                <Typography sx={{ color: QUIZ_COLORS.muted, lineHeight: 1.8 }}>
                  {quizData?.description ?? 'No description is available for this quiz.'}
                </Typography>
              </Paper>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                borderRadius: '20px',
                p: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                position: { lg: 'sticky' },
                top: 24
              }}
            >
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 3 }}>
                Quiz History
              </Typography>

              {quizHistory.length > 0 ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 5,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)'
                  }}
                >
                  <List sx={{ p: 0 }}>
                    {quizHistory.map((item) => {
                      const status = getHistoryStatus(item)
                      const correctAnswers = getCorrectAnswers(item)
                      const scorePercent = parseScore(item.score).percent
                      return (
                        <ListItem
                          key={item.sessionId}
                          sx={{
                            px: 0,
                            py: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 2
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                              flex: 1
                            }}
                          >
                            {/* Started */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <CalendarMonth sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                                Started: {formatDateTime(item.startedAt)}
                              </Typography>
                            </Box>

                            {/* Ended */}
                            {item.endedAt && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                <CalendarMonth sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography
                                  variant='body2'
                                  sx={{
                                    color: 'text.secondary'
                                  }}
                                >
                                  Ended: {formatDateTime(item.endedAt)}
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <Stack spacing={0.25} sx={{ alignItems: 'flex-end', minWidth: 130 }}>
                            <Chip
                              icon={getStatusIcon(status)}
                              label={getStatusLabel(status)}
                              size='small'
                              color={getStatusColor(status)}
                              sx={{
                                fontWeight: 500,
                                minWidth: 95,
                                justifyContent: 'center',
                                '& .MuiChip-label': {
                                  width: '100%',
                                  textAlign: 'center'
                                }
                              }}
                            />
                            <Typography variant='caption' sx={{ color: 'primary.main' }}>
                              Score: {item.score} ({scorePercent}%)
                            </Typography>
                            {correctAnswers !== null && (
                              <Typography variant='caption' sx={{ color: 'success.main' }}>
                                Correct: {correctAnswers}
                              </Typography>
                            )}
                            {item.skillEstimate && (
                              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                Skill: {item.skillEstimate}
                              </Typography>
                            )}
                          </Stack>
                        </ListItem>
                      )
                    })}
                  </List>
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant='body2' sx={{ color: QUIZ_COLORS.muted }}>
                    No quiz history yet.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
