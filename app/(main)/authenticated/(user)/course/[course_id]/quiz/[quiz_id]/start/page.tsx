'use client'

import api from '@/api/api'
import { useAlert } from '@/components/Alert'
import { authUtils } from '@/utils/auth'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { ArrowBack, CheckCircle, Replay, WarningAmber } from '@mui/icons-material'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import { Box, Button, Chip, Container, Divider, IconButton, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

type QuizOption = {
  id: string
  optionText: string
}

type QuizQuestion = {
  id: string
  questionText: string
  questionType?: string
  options: QuizOption[]
}

type QuizProgress = {
  current: number
  total: number
  percentComplete: number
}

type QuizFeedback = {
  isCorrect: boolean
  correctOptionId: string
  explanation: string
  optionReasons?: Array<{
    optionId: string
    reason?: string
  }>
}

type QuizSummary = {
  accuracy: number
  correct: number
  total: number
  skillEstimate: string
  encouragement: string
  missedQuestions: string[]
}

type TakeQuizResponse = {
  type: 'question' | 'summary'
  progress?: QuizProgress
  question?: QuizQuestion
  accuracy?: number
  correct?: number
  total?: number
  skillEstimate?: string
  encouragement?: string
  missedQuestions?: string[]
}

type SubmitAnswerResponse = {
  type: 'feedback_with_next' | 'feedback_final' | 'feedback_only'
  feedback: QuizFeedback
  progress?: QuizProgress
  skillEstimate?: string
  nextQuestion?: QuizQuestion | null
  summary?: QuizSummary
}

const QUIZ_COLORS = {
  primary: '#FFD700',
  primarySoft: '#FFF9C4',
  primaryDeep: '#B8860B',
  background: '#FFFCF1',
  surface: 'rgba(255,255,255,0.96)',
  border: 'rgba(15, 23, 42, 0.08)',
  text: '#0f172a',
  muted: '#64748b'
}

const PAGE_BACKGROUND = 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)'

const PRIMARY_BUTTON_SX = {
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
}

const OUTLINE_BUTTON_SX = {
  borderColor: QUIZ_COLORS.primary,
  color: QUIZ_COLORS.text,
  fontWeight: 700,
  textTransform: 'none',
  borderRadius: 2,
  px: 3,
  py: 1.5,
  '&:hover': {
    borderColor: QUIZ_COLORS.primaryDeep,
    backgroundColor: 'rgba(255, 215, 0, 0.08)'
  }
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? '')
}

export default function QuizStart() {
  const params = useParams()
  const router = useRouter()
  const { showAlert } = useAlert()

  const courseId = getParam(params.course_id as string | string[] | undefined)
  const quizId = getParam(params.quiz_id as string | string[] | undefined)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [question, setQuestion] = useState<QuizQuestion | null>(null)
  const [progress, setProgress] = useState<QuizProgress | null>(null)
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null)
  const [summary, setSummary] = useState<QuizSummary | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [feedbackQuestion, setFeedbackQuestion] = useState<QuizQuestion | null>(null)
  const [pendingNextQuestion, setPendingNextQuestion] = useState<QuizQuestion | null>(null)
  const [pendingSummary, setPendingSummary] = useState<QuizSummary | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const { userData } = authUtils.getAuth()
    setUserId(userData?.id ?? null)
  }, [])

  const apiRoot = useMemo(() => {
    if (!userId || !quizId) return null
    return `/courses/quizzes/${userId}/${quizId}`
  }, [quizId, userId])

  const loadQuiz = useCallback(async () => {
    if (!apiRoot) {
      setError('Missing quiz or user information.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setFeedback(null)
    setSummary(null)
    setSelectedOptionId(null)
    setFeedbackQuestion(null)
    setPendingNextQuestion(null)
    setPendingSummary(null)

    try {
      const response = await api.post(`${apiRoot}/take`)
      const payload = (response.data?.data ?? response.data) as TakeQuizResponse

      if (payload.type === 'summary') {
        setSummary({
          accuracy: payload.accuracy ?? 0,
          correct: payload.correct ?? 0,
          total: payload.total ?? 0,
          skillEstimate: payload.skillEstimate ?? 'basic',
          encouragement: payload.encouragement ?? 'Try again after reviewing the material.',
          missedQuestions: payload.missedQuestions ?? []
        })
        setQuestion(null)
        setProgress(null)
        return
      }

      setQuestion(payload.question ?? null)
      setProgress(payload.progress ?? null)
    } catch (requestError) {
      const message = 'Unable to load quiz. Please try again.'
      setError(message)
      showAlert(message, 'error', {
        vertical: 'bottom',
        horizontal: 'left'
      })
      console.error('Failed to start the quiz.', requestError)
    } finally {
      setLoading(false)
    }
  }, [apiRoot])

  useEffect(() => {
    void loadQuiz()
  }, [loadQuiz])

  const handleSubmitAnswer = async () => {
    if (!apiRoot || !question || !selectedOptionId) return

    setSubmitting(true)
    try {
      const response = await api.post(`${apiRoot}/answer`, {
        questionId: question.id,
        selectedOptionId
      })
      const payload = (response.data?.data ?? response.data) as SubmitAnswerResponse

      setFeedback(payload.feedback)
      setFeedbackQuestion(question)
      setProgress(payload.progress ?? progress)
      setPendingNextQuestion(payload.nextQuestion ?? null)

      if (payload.type === 'feedback_final') {
        setPendingSummary(payload.summary ?? null)
      } else {
        setPendingSummary(null)
      }

      if (payload.type !== 'feedback_final' && payload.type !== 'feedback_with_next' && !payload.nextQuestion) {
        showAlert('Your answer was saved. Continue when you are ready.', 'info', {
          vertical: 'bottom',
          horizontal: 'left'
        })
      }
    } catch (requestError) {
      console.error('Failed to submit answer.', requestError)
      showAlert('Unable to submit your answer.', 'error', {
        vertical: 'bottom',
        horizontal: 'left'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = () => {
    if (pendingSummary) {
      setSummary(pendingSummary)
      setQuestion(null)
      setFeedback(null)
      setFeedbackQuestion(null)
      setPendingSummary(null)
      setPendingNextQuestion(null)
      setSelectedOptionId(null)
      return
    }

    if (pendingNextQuestion) {
      setQuestion(pendingNextQuestion)
      setFeedback(null)
      setFeedbackQuestion(null)
      setPendingSummary(null)
      setPendingNextQuestion(null)
      setSelectedOptionId(null)
      return
    }

    showAlert('No next question is available yet.', 'warning', {
      vertical: 'bottom',
      horizontal: 'left'
    })
  }

  const goToOverview = () => {
    router.push(`/authenticated/course/${courseId}/quiz/${quizId}/overview`)
  }

  const accentChipSx = {
    color: QUIZ_COLORS.text,
    border: `1px solid ${QUIZ_COLORS.border}`,
    fontWeight: 700
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: PAGE_BACKGROUND,
          pb: 8,
          px: 4
        }}
      >
        <Container maxWidth='xl' sx={{ py: 4 }}>
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
            <Stack spacing={3}>
              <Skeleton variant='text' width='40%' height={56} />
              <Skeleton variant='rounded' height={180} sx={{ borderRadius: 4 }} />
              <Skeleton variant='rounded' height={260} sx={{ borderRadius: 4 }} />
            </Stack>
          </Paper>
        </Container>
      </Box>
    )
  }

  if (error && !question && !summary) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: PAGE_BACKGROUND,
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
              <Chip label='Quiz' sx={accentChipSx} />
              <Typography variant='h4' sx={{ fontWeight: 800, color: QUIZ_COLORS.text }}>
                Unable to load quiz
              </Typography>
              <Typography sx={{ color: QUIZ_COLORS.muted }}>{error}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant='contained' onClick={() => void loadQuiz()} sx={PRIMARY_BUTTON_SX}>
                  Retry
                </Button>
                <Button variant='outlined' onClick={goToOverview} sx={OUTLINE_BUTTON_SX}>
                  Go to overview
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>
    )
  }

  if (summary) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: PAGE_BACKGROUND,
          pb: 8,
          px: 4
        }}
      >
        <Container maxWidth='md' sx={{ py: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 6,
              background: QUIZ_COLORS.surface,
              border: `1px solid ${QUIZ_COLORS.border}`,
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)'
            }}
          >
            <Stack spacing={3} alignItems='flex-start'>
              <Chip icon={<CheckCircle />} label='Quiz completed' color='success' sx={accentChipSx} />
              <Box>
                <Typography variant='h4' sx={{ fontWeight: 800, color: QUIZ_COLORS.text, mb: 1 }}>
                  Quiz completed
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
                <Paper
                  variant='outlined'
                  sx={{
                    flex: 1,
                    p: 2.5,
                    borderRadius: 4,
                    borderColor: QUIZ_COLORS.border,
                    background: QUIZ_COLORS.primarySoft
                  }}
                >
                  <Typography variant='body2' sx={{ color: QUIZ_COLORS.muted, mb: 0.5 }}>
                    Accuracy
                  </Typography>
                  <Typography variant='h4' sx={{ fontWeight: 800, color: QUIZ_COLORS.text }}>
                    {summary.accuracy}%
                  </Typography>
                </Paper>
                <Paper
                  variant='outlined'
                  sx={{
                    flex: 1,
                    p: 2.5,
                    borderRadius: 4,
                    borderColor: QUIZ_COLORS.border
                  }}
                >
                  <Typography variant='body2' sx={{ color: QUIZ_COLORS.muted, mb: 0.5 }}>
                    Correct answers
                  </Typography>
                  <Typography variant='h4' sx={{ fontWeight: 800, color: QUIZ_COLORS.text }}>
                    {summary.correct}/{summary.total}
                  </Typography>
                </Paper>
                <Paper
                  variant='outlined'
                  sx={{
                    flex: 1,
                    p: 2.5,
                    borderRadius: 4,
                    borderColor: QUIZ_COLORS.border
                  }}
                >
                  <Typography variant='body2' sx={{ color: QUIZ_COLORS.muted, mb: 0.5 }}>
                    Skill estimate
                  </Typography>
                  <Typography
                    variant='h5'
                    sx={{
                      fontWeight: 800,
                      color: QUIZ_COLORS.text,
                      textTransform: 'capitalize'
                    }}
                  >
                    {summary.skillEstimate}
                  </Typography>
                </Paper>
              </Stack>

              <Paper
                variant='outlined'
                sx={{
                  p: 3,
                  borderRadius: 4,
                  borderColor: QUIZ_COLORS.border,
                  background: '#fff'
                }}
              >
                <Typography variant='h6' sx={{ fontWeight: 800, mb: 1.5, color: QUIZ_COLORS.text }}>
                  System feedback
                </Typography>
                <Typography sx={{ color: QUIZ_COLORS.muted, lineHeight: 1.8 }}>{summary.encouragement}</Typography>
                {!!summary.missedQuestions.length && (
                  <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap sx={{ mt: 2 }}>
                    {summary.missedQuestions.map((item) => (
                      <Chip key={item} label={`Missed: ${item}`} size='small' sx={accentChipSx} />
                    ))}
                  </Stack>
                )}
              </Paper>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant='contained'
                  startIcon={<Replay />}
                  onClick={() => void loadQuiz()}
                  sx={PRIMARY_BUTTON_SX}
                >
                  Retake quiz
                </Button>
                <Button variant='outlined' startIcon={<ArrowBack />} onClick={goToOverview} sx={OUTLINE_BUTTON_SX}>
                  Back to overview
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>
    )
  }

  const progressPercent = progress?.percentComplete ?? 0
  const hasFeedback = Boolean(feedback)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: PAGE_BACKGROUND,
        pb: 8,
        px: 4
      }}
    >
      <Box sx={{ pt: 4, mb: 2 }}>
        <IconButton onClick={goToOverview}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Container maxWidth='xl'>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: 6,
              background: QUIZ_COLORS.surface,
              border: `1px solid ${QUIZ_COLORS.border}`,
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)'
            }}
          >
            <Stack spacing={3}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent='space-between'
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={2}
              >
                <Box>
                  <Typography variant='overline' sx={{ color: QUIZ_COLORS.primaryDeep, fontWeight: 800 }}>
                    Quiz Session
                  </Typography>
                  <Typography variant='h4' sx={{ fontWeight: 800, color: QUIZ_COLORS.text }}>
                    {question ? 'Quiz in progress' : 'Processing'}
                  </Typography>
                </Box>

                {progress && (
                  <Stack spacing={1} sx={{ minWidth: { xs: '100%', md: 320 } }}>
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography variant='body2' sx={{ color: QUIZ_COLORS.muted, fontWeight: 700 }}>
                        Question {progress.current}/{progress.total}
                      </Typography>
                      <Typography variant='body2' sx={{ color: QUIZ_COLORS.muted, fontWeight: 700 }}>
                        {progressPercent}%
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: 'rgba(15, 23, 42, 0.08)',
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${QUIZ_COLORS.primary} 0%, ${QUIZ_COLORS.primaryDeep} 100%)`
                        }}
                      />
                    </Box>
                  </Stack>
                )}
              </Stack>

              {question ? (
                <Stack spacing={2.5}>
                  <Box>
                    <Chip label={question.questionType ?? 'Multiple choice'} sx={accentChipSx} />
                  </Box>
                  <Typography
                    variant='h5'
                    sx={{
                      fontWeight: 800,
                      color: QUIZ_COLORS.text,
                      lineHeight: 1.5,
                      fontSize: { xs: '1.25rem', md: '1.5rem' }
                    }}
                  >
                    {question.questionText}
                  </Typography>

                  <Stack spacing={1.5}>
                    {question.options.map((option, index) => {
                      const selected = selectedOptionId === option.id
                      const isCorrectOption = hasFeedback && feedback?.correctOptionId === option.id
                      const isWrongSelected = hasFeedback && selected && !feedback?.isCorrect

                      // Compute styles based on feedback state
                      let borderColor = QUIZ_COLORS.border
                      let backgroundColor = '#fff'
                      let boxShadow = 'none'
                      if (hasFeedback) {
                        if (isCorrectOption) {
                          borderColor = 'rgba(34, 197, 94, 0.6)'
                          backgroundColor = 'rgba(34, 197, 94, 0.08)'
                          boxShadow = '0 4px 16px rgba(34, 197, 94, 0.15)'
                        } else if (isWrongSelected) {
                          borderColor = 'rgba(239, 68, 68, 0.6)'
                          backgroundColor = 'rgba(239, 68, 68, 0.07)'
                          boxShadow = '0 4px 16px rgba(239, 68, 68, 0.12)'
                        }
                      } else if (selected) {
                        borderColor = QUIZ_COLORS.primaryDeep
                        backgroundColor = 'rgba(255, 215, 0, 0.14)'
                        boxShadow = '0 8px 24px rgba(255, 215, 0, 0.18)'
                      }

                      let badgeBg = selected ? QUIZ_COLORS.primary : 'rgba(15, 23, 42, 0.05)'
                      if (hasFeedback) {
                        if (isCorrectOption) badgeBg = '#22c55e'
                        else if (isWrongSelected) badgeBg = '#ef4444'
                        else badgeBg = 'rgba(15, 23, 42, 0.05)'
                      }
                      const badgeColor = hasFeedback && (isCorrectOption || isWrongSelected) ? '#fff' : QUIZ_COLORS.text

                      return (
                        <Button
                          key={option.id}
                          fullWidth
                          onClick={() => setSelectedOptionId(option.id)}
                          disabled={submitting || hasFeedback}
                          variant='outlined'
                          sx={{
                            justifyContent: 'flex-start',
                            textTransform: 'none',
                            textAlign: 'left',
                            px: 2.25,
                            py: 1.75,
                            borderRadius: 4,
                            borderColor,
                            backgroundColor,
                            color: QUIZ_COLORS.text,
                            fontWeight: 600,
                            boxShadow,
                            transition: 'all 0.2s',
                            '&:hover': !hasFeedback
                              ? {
                                  borderColor: QUIZ_COLORS.primaryDeep,
                                  backgroundColor: 'rgba(255, 215, 0, 0.10)'
                                }
                              : {},
                            // Keep colors visible when disabled (after feedback shown)
                            '&.Mui-disabled': {
                              borderColor,
                              backgroundColor,
                              color: QUIZ_COLORS.text,
                              opacity: 1
                            }
                          }}
                        >
                          <Stack direction='row' spacing={1.5} alignItems='flex-start' sx={{ width: '100%' }}>
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                display: 'grid',
                                placeItems: 'center',
                                backgroundColor: badgeBg,
                                color: badgeColor,
                                flexShrink: 0,
                                fontWeight: 800,
                                transition: 'all 0.2s'
                              }}
                            >
                              {String.fromCharCode(65 + index)}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                sx={{
                                  lineHeight: 1.7,
                                  color: QUIZ_COLORS.text,
                                  fontWeight: isCorrectOption ? 700 : 600
                                }}
                              >
                                {option.optionText}
                              </Typography>
                              {hasFeedback && isCorrectOption && (
                                <Typography variant='caption' sx={{ color: '#16a34a', fontWeight: 700 }}>
                                  ✓ Đáp án đúng
                                </Typography>
                              )}
                              {hasFeedback && isWrongSelected && (
                                <Typography variant='caption' sx={{ color: '#dc2626', fontWeight: 700 }}>
                                  ✗ Lựa chọn của bạn — sai
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </Button>
                      )
                    })}
                  </Stack>

                  {hasFeedback && feedbackQuestion && (
                    <Paper
                      variant='outlined'
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        borderColor: feedback?.isCorrect ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)',
                        background: feedback?.isCorrect ? 'rgba(34, 197, 94, 0.06)' : 'rgba(239, 68, 68, 0.05)'
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          {feedback?.isCorrect ? (
                            <CheckCircle sx={{ color: '#16a34a' }} />
                          ) : (
                            <WarningAmber sx={{ color: '#dc2626' }} />
                          )}
                          <Typography sx={{ fontWeight: 800, color: QUIZ_COLORS.text }}>
                            {feedback?.isCorrect ? 'Correct!' : 'Incorrect'}
                          </Typography>
                        </Stack>
                        <Typography sx={{ color: QUIZ_COLORS.muted, lineHeight: 1.75 }}>
                          {feedback?.explanation}
                        </Typography>
                        <Divider />
                        <Typography variant='body2' sx={{ fontWeight: 700, color: QUIZ_COLORS.text }}>
                          Option explanations:
                        </Typography>
                        <Stack spacing={1}>
                          {feedback?.optionReasons?.length ? (
                            feedback.optionReasons.map((item) => {
                              const optionIndex = feedbackQuestion.options.findIndex((opt) => opt.id === item.optionId)
                              const optionText = feedbackQuestion.options.find(
                                (opt) => opt.id === item.optionId
                              )?.optionText
                              const optionLabel =
                                optionIndex >= 0
                                  ? `Option ${String.fromCharCode(65 + optionIndex)}`
                                  : `Option ${item.optionId}`
                              const isThisCorrect = item.optionId === feedback?.correctOptionId
                              const isThisWrongSelected = item.optionId === selectedOptionId && !feedback?.isCorrect

                              return (
                                <Box
                                  key={item.optionId}
                                  sx={{
                                    display: 'flex',
                                    gap: 1.5,
                                    alignItems: 'flex-start',
                                    p: 1.5,
                                    borderRadius: 2,
                                    background: isThisCorrect
                                      ? 'rgba(34, 197, 94, 0.07)'
                                      : isThisWrongSelected
                                        ? 'rgba(239, 68, 68, 0.06)'
                                        : 'transparent'
                                  }}
                                >
                                  <RadioButtonCheckedIcon
                                    sx={{
                                      fontSize: 18,
                                      color: isThisCorrect
                                        ? '#16a34a'
                                        : isThisWrongSelected
                                          ? '#dc2626'
                                          : QUIZ_COLORS.muted,
                                      mt: 0.2
                                    }}
                                  />
                                  <Box>
                                    <Typography
                                      variant='body2'
                                      sx={{
                                        color: isThisCorrect
                                          ? '#16a34a'
                                          : isThisWrongSelected
                                            ? '#dc2626'
                                            : QUIZ_COLORS.text,
                                        fontWeight: 700
                                      }}
                                    >
                                      {optionLabel}
                                      {optionText ? `: ${optionText}` : ''}
                                      {isThisCorrect && ' ✓'}
                                      {isThisWrongSelected && ' ✗'}
                                    </Typography>
                                    <Typography
                                      variant='body2'
                                      sx={{
                                        color: QUIZ_COLORS.muted,
                                        lineHeight: 1.7
                                      }}
                                    >
                                      {item.reason ?? 'No explanation provided.'}
                                    </Typography>
                                  </Box>
                                </Box>
                              )
                            })
                          ) : (
                            <Typography variant='body2' sx={{ color: QUIZ_COLORS.muted }}>
                              Your answer has been recorded.
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {hasFeedback ? (
                      <Button
                        variant='contained'
                        onClick={handleNext}
                        sx={{
                          ...PRIMARY_BUTTON_SX,
                          px: 3
                        }}
                      >
                        {pendingSummary ? 'Finish quiz' : 'Next question'}
                      </Button>
                    ) : (
                      <Button
                        variant='contained'
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOptionId || submitting}
                        sx={{
                          ...PRIMARY_BUTTON_SX,
                          px: 3,
                          '&:disabled': {
                            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                            opacity: 0.7,
                            color: 'rgba(15, 23, 42, 0.45)'
                          }
                        }}
                      >
                        {submitting ? 'Submitting...' : 'Submit answer'}
                      </Button>
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Paper
                  variant='outlined'
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    borderColor: QUIZ_COLORS.border,
                    background: '#fff'
                  }}
                >
                  <Stack spacing={1.5} alignItems='flex-start'>
                    <Typography variant='h6' sx={{ fontWeight: 800, color: QUIZ_COLORS.text }}>
                      No more questions available
                    </Typography>
                    <Typography sx={{ color: QUIZ_COLORS.muted }}>
                      If the quiz is complete, you can review the results on the overview page.
                    </Typography>
                    <Button variant='contained' onClick={goToOverview} sx={PRIMARY_BUTTON_SX}>
                      Go to overview
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}
