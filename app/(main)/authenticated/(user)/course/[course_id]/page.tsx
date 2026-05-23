'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton,
  Divider,
  Skeleton,
  Avatar,
  Rating,
  Chip,
  SvgIcon,
  ListItemButton,
  Snackbar,
  Alert,
  Fade
} from '@mui/material'
import TheatersIcon from '@mui/icons-material/Theaters'
import {
  ExpandMore as ExpandMoreIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Devices as DevicesIcon,
  CardMembership as CertificateIcon,
  ViewModule as ModuleIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Instagram as InstagramIcon,
  Telegram as TelegramIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Description as DescriptionIcon,
  Quiz as QuizIcon,
  EditOutlined as EditOutlinedIcon,
  DeleteOutlineOutlined as DeleteOutlineOutlinedIcon,
  AddOutlined as AddOutlinedIcon,
  DragIndicator as DragIndicatorIcon,
  CheckRounded as CheckRoundedIcon,
  CloseRounded as CloseRoundedIcon,
  SaveOutlined as SaveOutlinedIcon
} from '@mui/icons-material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useParams, useRouter } from 'next/navigation'
import { useAlert } from '@/components/Alert'
import api from '@/api/api'
import SafeHtml from '@/components/SafeHtml'
import CircularProgressWithLabel from '@/components/CircularProgressWithLabel'
import { Course } from '@/utils/dto/Course'
import { Chapter } from '@/utils/dto/Chapter'
import { LessonGeneral } from '@/utils/dto/Lesson'
import { authUtils } from '@/utils/auth'
import { useCreateChapter, useDeleteChapter, useUpdateChapter, useUpdateChapterOrder } from '@/hooks/useChapters'
import { useCreateLesson, useDeleteLesson, useUpdateLesson, useUpdateLessonOrder } from '@/hooks/useLessons'
import ChapterModal from '@/components/instructor/courses/ChapterModal'
import LessonModal from '@/components/instructor/courses/LessonModal'
import ConfirmModal from '@/components/Confirm'
import { CodeIcon, FlaskConical, HelpCircle, PlayCircle } from 'lucide-react'

const formatDuration = (seconds?: number): string => {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const cloneOrder = (chapters: Chapter[]): Chapter[] =>
  chapters.map((ch) => ({
    ...ch,
    lessons: ch.lessons ? [...ch.lessons] : []
  }))

const hasOrderChanged = (original: Chapter[], modified: Chapter[]): boolean => {
  if (original.length !== modified.length) return true
  for (let i = 0; i < original.length; i++) {
    if (original[i].id !== modified[i].id) return true
    const oLessons = original[i].lessons || []
    const mLessons = modified[i].lessons || []
    if (oLessons.length !== mLessons.length) return true
    for (let j = 0; j < oLessons.length; j++) {
      if (oLessons[j].id !== mLessons[j].id) return true
    }
  }
  return false
}

export const getLessonIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'lesson':
      return <PlayCircle size={20} color='#00bdd5' />
    case 'lab':
      return <FlaskConical size={20} color='#7c3aed' />
    case 'quiz':
      return <HelpCircle size={20} color='#f59e0b' />
    default:
      return <DescriptionIcon sx={{ fontSize: 20, color: '#757575' }} />
  }
}

export default function CourseDetail() {
  const { course_id } = useParams()
  const courseId = Array.isArray(course_id) ? course_id[0] : course_id
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState<Course>()
  const [chapterModalOpen, setChapterModalOpen] = useState(false)
  const [lessonModalOpen, setLessonModalOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState<any>(null)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => Promise<void>
  }>({ open: false, title: '', description: '', onConfirm: async () => {} })
  const [dragChapterId, setDragChapterId] = useState<string | null>(null)
  const [dragLesson, setDragLesson] = useState<{ chapterId: string; lessonId: string } | null>(null)
  const [dropTargetChapterId, setDropTargetChapterId] = useState<string | null>(null)
  const [dropTargetLessonId, setDropTargetLessonId] = useState<string | null>(null)

  const [originalOrder, setOriginalOrder] = useState<Chapter[]>([])
  const [modifiedOrder, setModifiedOrder] = useState<Chapter[]>([])
  const isDirty = useMemo(() => hasOrderChanged(originalOrder, modifiedOrder), [originalOrder, modifiedOrder])

  const { userData } = authUtils.getAuth()
  const isTeacher = useMemo(
    () =>
      String(userData?.role || '').toLowerCase() === 'teacher' && !!course?.user?.id && course.user.id === userData?.id,
    [userData, course]
  )

  const { create: createChapter, loading: creatingChapter, error: createChapterError } = useCreateChapter()
  const { update: updateChapter, loading: updatingChapter, error: updateChapterError } = useUpdateChapter()
  const { updateOrder: updateChapterOrder, loading: updatingChapterOrder } = useUpdateChapterOrder()
  const { remove: removeChapter, loading: deletingChapter } = useDeleteChapter()

  const { create: createLesson, loading: creatingLesson, error: createLessonError } = useCreateLesson()
  const { update: updateLesson, loading: updatingLesson, error: updateLessonError } = useUpdateLesson()
  const { remove: removeLesson, loading: deletingLesson } = useDeleteLesson()
  const { updateLessonOrder, loading: updatingLessonOrder, error: updateLessonOrderError } = useUpdateLessonOrder()

  const { showAlert } = useAlert()

  const fetchCourse = useCallback(async () => {
    if (!courseId) return
    try {
      setLoading(true)
      const courseResponse = await api.get(`/courses/course/${courseId}?include=full`)
      const data: Course = courseResponse.data.data
      setCourse(data)
      const sorted = [...(data?.chapters?.chapters || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      setOriginalOrder(cloneOrder(sorted))
      setModifiedOrder(cloneOrder(sorted))
    } catch (error) {
      console.error('Error fetching course:', error)
      showAlert('Failed to fetch detail of the course', 'error', {
        vertical: 'bottom',
        horizontal: 'left'
      })
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  const orderedChapters = modifiedOrder

  const reorderArray = <T,>(items: T[], fromIndex: number, toIndex: number) => {
    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    return next
  }

  const handleChapterDrop = (targetChapterId: string) => {
    setDropTargetChapterId(null)
    if (!dragChapterId || dragChapterId === targetChapterId) return

    setModifiedOrder((prev) => {
      const from = prev.findIndex((ch) => ch.id === dragChapterId)
      const to = prev.findIndex((ch) => ch.id === targetChapterId)
      if (from < 0 || to < 0) return prev
      return reorderArray(prev, from, to)
    })
    setDragChapterId(null)
  }

  const handleLessonDrop = (targetChapterId: string, targetLessonId: string) => {
    setDropTargetLessonId(null)
    if (!dragLesson) return

    const sourceChapterId = dragLesson.chapterId
    const sourceLessonId = dragLesson.lessonId

    if (sourceChapterId === targetChapterId) {
      // Same chapter reorder
      if (sourceLessonId === targetLessonId) return
      setModifiedOrder((prev) =>
        prev.map((ch) => {
          if (ch.id !== targetChapterId) return ch
          const lessons = ch.lessons || []
          const from = lessons.findIndex((l) => l.id === sourceLessonId)
          const to = lessons.findIndex((l) => l.id === targetLessonId)
          if (from < 0 || to < 0) return ch
          return { ...ch, lessons: reorderArray(lessons, from, to) }
        })
      )
    } else {
      // Cross-chapter move
      setModifiedOrder((prev) => {
        let movedLesson: LessonGeneral | undefined
        const withRemoved = prev.map((ch) => {
          if (ch.id !== sourceChapterId) return ch
          const lessons = ch.lessons || []
          const idx = lessons.findIndex((l) => l.id === sourceLessonId)
          if (idx < 0) return ch
          movedLesson = lessons[idx]
          return { ...ch, lessons: lessons.filter((_, i) => i !== idx) }
        })
        if (!movedLesson) return prev
        return withRemoved.map((ch) => {
          if (ch.id !== targetChapterId) return ch
          const lessons = ch.lessons || []
          const toIdx = lessons.findIndex((l) => l.id === targetLessonId)
          const insertAt = toIdx >= 0 ? toIdx : lessons.length
          const next = [...lessons]
          next.splice(insertAt, 0, movedLesson!)
          return { ...ch, lessons: next }
        })
      })
    }
    setDragLesson(null)
  }

  // ── Persist helpers ──────────────────────────────────────────────────────────
  const persistChapterOrder = async (chapters: Chapter[]) => {
    await updateChapterOrder(course_id as string, {
      chapters: chapters.map((chapter, index) => ({
        chapter_id: chapter.id,
        sort_order: index + 1
      }))
    })
  }

  const persistLessonOrder = async (chapterId: string, lessons: LessonGeneral[]) => {
    await updateLessonOrder(course_id as string, chapterId, {
      lessons: lessons.map((lesson, index) => ({
        lesson_id: lesson.id,
        sort_order: index + 1
      }))
    })
  }

  const handleConfirmOrder = async () => {
    setIsSavingOrder(true)
    try {
      await persistChapterOrder(modifiedOrder)

      for (const chapter of modifiedOrder) {
        const origChapter = originalOrder.find((c) => c.id === chapter.id)
        const origLessons = origChapter?.lessons || []
        const newLessons = chapter.lessons || []
        const lessonsChanged =
          origLessons.length !== newLessons.length || origLessons.some((l, i) => l.id !== newLessons[i]?.id)
        if (lessonsChanged) {
          await persistLessonOrder(chapter.id, newLessons)
        }
      }
      showAlert('Order updated successfully', 'success', { vertical: 'bottom', horizontal: 'left' })
      setOriginalOrder(cloneOrder(modifiedOrder))
    } catch (e: any) {
      const message = e.response?.data?.message || e.message || 'Failed to update order'
      showAlert(message, 'error', { vertical: 'bottom', horizontal: 'left' })
      setModifiedOrder(cloneOrder(originalOrder))
    } finally {
      setIsSavingOrder(false)
    }
  }

  const handleCancelOrder = () => {
    setModifiedOrder(cloneOrder(originalOrder))
  }

  // ── CRUD handlers ────────────────────────────────────────────────────────────
  const handleChapterSubmit = async (data: any) => {
    if (!courseId) return
    if (editingChapter) {
      const updated = await updateChapter(editingChapter.id, data)
      if (updated) {
        setChapterModalOpen(false)
        setEditingChapter(null)
        showAlert('Chapter updated successfully', 'success', { vertical: 'bottom', horizontal: 'left' })
        fetchCourse()
      }
      return
    }
    const created = await createChapter({ ...data, course_id: String(courseId) })
    if (created) {
      setChapterModalOpen(false)
      showAlert('Chapter created successfully', 'success', { vertical: 'bottom', horizontal: 'left' })
      fetchCourse()
    }
  }

  const handleLessonSubmit = async (data: any) => {
    if (!selectedChapterId) return

    if (editingLesson) {
      const updated = await updateLesson(editingLesson.id, { ...data, chapter_id: selectedChapterId })
      if (updated) {
        setLessonModalOpen(false)
        setEditingLesson(null)
        showAlert('Lesson updated successfully', 'success', { vertical: 'bottom', horizontal: 'left' })
        fetchCourse()
      }
      return
    }

    const created = await createLesson({ ...data, chapter_id: selectedChapterId })
    if (created) {
      console.log('Created lesson:', created)
      setLessonModalOpen(false)
      showAlert('Lesson created successfully', 'success', { vertical: 'bottom', horizontal: 'left' })
      if (created.data.type === 'lesson' || created.data.type === 'lab')
        router.push(`/authenticated/instructor/course/${courseId}/lesson/${created.data.id}/media`)
      else if (created.data.type === 'quiz')
        router.push(`/authenticated/instructor/course/${courseId}/quiz/${created.data.id}`)
    }
  }

  const handleDeleteChapter = (chapterId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete chapter?',
      description: 'This will permanently delete the chapter and all its lessons. This action cannot be undone.',
      onConfirm: async () => {
        const ok = await removeChapter(chapterId)
        setConfirmDialog((prev) => ({ ...prev, open: false }))
        if (ok) {
          showAlert('Chapter deleted', 'success', { vertical: 'bottom', horizontal: 'left' })
          fetchCourse()
          return
        }
        showAlert('Failed to delete chapter', 'error', { vertical: 'bottom', horizontal: 'left' })
      }
    })
  }

  const handleDeleteLesson = (lessonId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete lesson?',
      description: 'This will permanently delete this lesson. This action cannot be undone.',
      onConfirm: async () => {
        const ok = await removeLesson(lessonId)
        setConfirmDialog((prev) => ({ ...prev, open: false }))
        if (ok) {
          showAlert('Lesson deleted', 'success', { vertical: 'bottom', horizontal: 'left' })
          fetchCourse()
          return
        }
        showAlert('Failed to delete lesson', 'error', { vertical: 'bottom', horizontal: 'left' })
      }
    })
  }

  const onCLickLessonHandle = (lessonId: string) => {
    if (course?.isEnrolled && courseId) {
      router.replace(`/authenticated/course/${courseId}/${lessonId}`)
    }
  }

  if (loading || !course) {
    return (
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4, px: 4 }}>
        <Container maxWidth='xl'>
          <Skeleton variant='rectangular' width='100%' height={400} sx={{ borderRadius: 2, mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Skeleton variant='text' width='40%' height={40} sx={{ mb: 2 }} />
                <Box sx={{ mb: 3 }}>
                  <Skeleton variant='text' width='30%' height={20} sx={{ mb: 1 }} />
                  <Skeleton variant='rectangular' width='100%' height={8} sx={{ borderRadius: 1 }} />
                </Box>
                {[1, 2, 3].map((item) => (
                  <Paper key={item} sx={{ mb: 1, p: 2, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Skeleton variant='text' width='40%' height={24} />
                      <Skeleton variant='circular' width={24} height={24} />
                    </Box>
                  </Paper>
                ))}
              </Paper>
            </Box>
            <Box sx={{ width: { xs: '100%', md: 350 } }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Skeleton variant='text' width='60%' height={50} sx={{ mb: 2 }} />
                <Skeleton variant='rectangular' width='100%' height={50} sx={{ borderRadius: 1, mb: 3 }} />
                <Divider sx={{ mb: 2 }} />
                <Skeleton variant='text' width='70%' height={32} sx={{ mb: 2 }} />
                {[1, 2, 3, 4].map((item) => (
                  <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Skeleton variant='circular' width={24} height={24} />
                    <Skeleton variant='text' width='70%' />
                  </Box>
                ))}
              </Paper>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Skeleton variant='text' width='80%' height={32} sx={{ mb: 1 }} />
                <Skeleton variant='text' width='100%' />
                <Skeleton variant='text' width='90%' />
              </Paper>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Skeleton variant='text' width='60%' height={32} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Skeleton key={item} variant='circular' width={40} height={40} />
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4, px: 4 }}>
      <Container maxWidth='xl'>
        {/* Header Image */}
        <Box
          component='img'
          src={course.thumbnail_url?.trim() ? course.thumbnail_url : '/images/no_image.jpg'}
          sx={{ width: '100%', height: 400, objectFit: 'cover', display: 'block', borderRadius: 2, mb: 3 }}
        />

        <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          {/* Left Column - Course Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Course Information Section */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant='h4' fontWeight='bold' gutterBottom>
                {course.title}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={course.course_level}
                  size='small'
                  sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={course.rating || 0} precision={0.1} readOnly size='small' />
                <Typography variant='body2' color='text.secondary'>
                  ({course.rating?.toFixed(1) || '0.0'})
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={course.user?.avt_url?.trim() || undefined}
                  alt={course.user?.name ?? ''}
                  sx={{ bgcolor: '#151312', width: 32, height: 32, mr: 1 }}
                />
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Created by
                  </Typography>
                  <Typography variant='body1' fontWeight='500'>
                    {course.user?.name || 'Unknown'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {course.long_description && <SafeHtml html={course.long_description} />}
            </Paper>

            {/* Course Content Section */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2,
                  flexWrap: 'wrap'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant='h5' fontWeight='bold'>
                    Course Content
                  </Typography>
                  {/* Unsaved changes indicator */}
                  {isTeacher && isDirty && (
                    <Chip
                      label='Unsaved changes'
                      size='small'
                      sx={{
                        bgcolor: '#fff3e0',
                        color: '#e65100',
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.6 }
                        }
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Confirm / Cancel order buttons */}
                  {isTeacher && isDirty && (
                    <Fade in={isDirty}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant='outlined'
                          size='small'
                          startIcon={<CloseRoundedIcon />}
                          onClick={handleCancelOrder}
                          disabled={isSavingOrder}
                          sx={{
                            borderColor: '#e0e0e0',
                            borderRadius: 2,
                            color: '#757575',
                            '&:hover': { borderColor: '#bdbdbd', bgcolor: '#fafafa' }
                          }}
                        >
                          Cancel
                        </Button>

                        <Button
                          variant='contained'
                          disabled={isSavingOrder}
                          onClick={handleConfirmOrder}
                          startIcon={<SaveOutlinedIcon />}
                          sx={{
                            bgcolor: '#4caf50',
                            '&:hover': { bgcolor: '#43a047' },
                            '&:disabled': { bgcolor: '#a5d6a7' },
                            color: '#151312',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: 'none'
                          }}
                        >
                          {isSavingOrder ? 'Saving…' : 'Confirm'}
                        </Button>
                      </Box>
                    </Fade>
                  )}
                  {isTeacher && (
                    <Button
                      variant='contained'
                      onClick={() => {
                        setEditingChapter(null)
                        setChapterModalOpen(true)
                      }}
                      sx={{
                        backgroundColor: '#FFD700',
                        color: '#151312',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#FFC700', boxShadow: 'none' }
                      }}
                    >
                      Add Chapter
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {course.chapters?.progress}% COMPLETED
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={course.chapters?.progress || 0}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': { bgcolor: '#ffd700' }
                  }}
                />
              </Box>

              {/* Course Chapters/Sections */}
              {orderedChapters.map((section: Chapter) => {
                const isDropTarget = dropTargetChapterId === section.id && dragChapterId !== section.id

                return (
                  <Accordion
                    key={section.id}
                    draggable={isTeacher}
                    onDragStart={(e) => {
                      if (!isTeacher) return
                      setDragChapterId(section.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragEnd={() => {
                      setDragChapterId(null)
                      setDropTargetChapterId(null)
                    }}
                    onDragOver={(e) => {
                      if (!isTeacher) return
                      e.preventDefault()
                      e.stopPropagation()
                      if (dragChapterId && dragChapterId !== section.id) {
                        setDropTargetChapterId(section.id)
                      }
                    }}
                    onDragLeave={() => {
                      if (dropTargetChapterId === section.id) setDropTargetChapterId(null)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (isTeacher) handleChapterDrop(section.id)
                    }}
                    sx={{
                      mb: 1,
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      border: '1px solid #e0e0e0',
                      borderTop: isDropTarget ? '2px solid #FFD700' : '1px solid #e0e0e0',
                      borderRadius: '4px !important',
                      bgcolor: isDropTarget ? '#fffef0' : undefined,
                      opacity: dragChapterId === section.id ? 0.45 : 1,
                      transition: 'border-top 0.12s, opacity 0.12s, background-color 0.12s'
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          mr: 2,
                          gap: 2
                        }}
                      >
                        {/* LEFT */}
                        <Box sx={{ flex: 1, minWidth: 0, mr: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isTeacher && (
                            <DragIndicatorIcon
                              sx={{
                                color: '#9e9e9e',
                                cursor: 'grab',
                                flexShrink: 0,
                                '&:active': { cursor: 'grabbing' }
                              }}
                            />
                          )}
                          <Typography fontWeight='500' sx={{ wordBreak: 'break-word', textAlign: 'justify' }}>
                            {section.title}
                          </Typography>
                          {section.short_description && (
                            <Typography variant='caption' color='text.secondary'>
                              {section.short_description}
                            </Typography>
                          )}
                        </Box>

                        {/* RIGHT */}
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                          {isTeacher && (
                            <>
                              <IconButton
                                component='div'
                                size='small'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingChapter(section)
                                  setChapterModalOpen(true)
                                }}
                              >
                                <EditOutlinedIcon fontSize='small' />
                              </IconButton>
                              <IconButton
                                component='div'
                                size='small'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteChapter(section.id)
                                }}
                                disabled={deletingChapter}
                              >
                                <DeleteOutlineOutlinedIcon fontSize='small' />
                              </IconButton>
                              <IconButton
                                component='div'
                                size='small'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingLesson(null)
                                  setSelectedChapterId(section.id)
                                  setLessonModalOpen(true)
                                }}
                              >
                                <AddOutlinedIcon fontSize='small' />
                              </IconButton>
                            </>
                          )}
                          <Typography variant='body2' color='text.secondary'>
                            {section.lessons?.length || 0} Lessons
                          </Typography>
                          <CircularProgressWithLabel value={section.progress} />
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ bgcolor: '#fafafa', p: 0 }}>
                      <List disablePadding dense>
                        {[...(section.lessons || [])].map((lesson: LessonGeneral) => {
                          const isLessonDropTarget =
                            dropTargetLessonId === lesson.id && dragLesson?.lessonId !== lesson.id

                          return (
                            <ListItem disablePadding key={lesson.id}>
                              <ListItemButton
                                draggable={isTeacher}
                                onDragStart={(e) => {
                                  if (!isTeacher) return
                                  setDragLesson({ chapterId: section.id, lessonId: lesson.id })
                                  e.dataTransfer.effectAllowed = 'move'
                                  e.stopPropagation()
                                }}
                                onDragEnd={() => {
                                  setDragLesson(null)
                                  setDropTargetLessonId(null)
                                }}
                                onDragOver={(e) => {
                                  if (!isTeacher) return
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (dragLesson && dragLesson.lessonId !== lesson.id) {
                                    setDropTargetLessonId(lesson.id)
                                  }
                                }}
                                onDragLeave={(e) => {
                                  e.stopPropagation()
                                  if (dropTargetLessonId === lesson.id) setDropTargetLessonId(null)
                                }}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (isTeacher) handleLessonDrop(section.id, lesson.id)
                                }}
                                onClick={() => onCLickLessonHandle(lesson.id)}
                                sx={{
                                  py: 1.5,
                                  px: 2,
                                  borderBottom: '1px solid #f0f0f0',
                                  '&:last-child': { borderBottom: 'none' },
                                  borderTop: isLessonDropTarget ? '2px solid #FFD700' : undefined,
                                  bgcolor: isLessonDropTarget ? '#fffef0' : undefined,
                                  opacity: dragLesson?.lessonId === lesson.id ? 0.4 : 1,
                                  transition: 'border-top 0.12s, opacity 0.12s, background-color 0.12s'
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Box
                                    sx={{
                                      position: 'relative',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.5
                                    }}
                                  >
                                    {isTeacher && (
                                      <DragIndicatorIcon
                                        sx={{
                                          fontSize: 16,
                                          color: '#9e9e9e',
                                          cursor: 'grab',
                                          '&:active': { cursor: 'grabbing' }
                                        }}
                                      />
                                    )}
                                    {getLessonIcon(lesson.type)}
                                    {lesson.isFinished && (
                                      <CheckCircleIcon
                                        sx={{
                                          position: 'absolute',
                                          bottom: -2,
                                          right: -2,
                                          fontSize: 14,
                                          color: '#ffd700',
                                          bgcolor: 'white',
                                          borderRadius: '50%'
                                        }}
                                      />
                                    )}
                                  </Box>
                                </ListItemIcon>

                                <ListItemText
                                  primary={lesson.title}
                                  primaryTypographyProps={{ variant: 'body2', fontWeight: 400, noWrap: true }}
                                  sx={{ flexGrow: 1, minWidth: 0, ml: 1 }}
                                />

                                {lesson.type.toLowerCase() === 'video' && lesson.duration && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
                                    <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant='caption' color='text.secondary'>
                                      {formatDuration(lesson.duration)}
                                    </Typography>
                                  </Box>
                                )}

                                {isTeacher && (
                                  <Box sx={{ ml: 1, display: 'flex', gap: 0.5 }}>
                                    <IconButton
                                      size='small'
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingLesson(lesson)
                                        setSelectedChapterId(section.id)
                                        setLessonModalOpen(true)
                                      }}
                                    >
                                      <EditOutlinedIcon fontSize='small' />
                                    </IconButton>
                                    <IconButton
                                      size='small'
                                      onClick={(e) => {
                                        if (lesson.type === 'lesson' || lesson.type === 'lab')
                                          router.push(
                                            `/authenticated/instructor/course/${courseId}/lesson/${lesson.id}/media`
                                          )
                                        else if (lesson.type === 'quiz')
                                          router.push(`/authenticated/instructor/course/${courseId}/quiz/${lesson.id}`)
                                        e.stopPropagation()
                                      }}
                                    >
                                      {lesson.type === 'lesson' ? (
                                        <TheatersIcon fontSize='small' />
                                      ) : (
                                        <QuizIcon fontSize='small' />
                                      )}
                                    </IconButton>

                                    <IconButton
                                      size='small'
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteLesson(lesson.id)
                                      }}
                                      disabled={deletingLesson}
                                    >
                                      <DeleteOutlineOutlinedIcon fontSize='small' />
                                    </IconButton>
                                  </Box>
                                )}
                              </ListItemButton>
                            </ListItem>
                          )
                        })}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Paper>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 350 } }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              {!course.isEnrolled && (
                <Typography variant='h4' fontWeight='bold' gutterBottom>
                  {course.price ? `$${course.price}` : 'Free'}
                </Typography>
              )}
              <Button
                variant='contained'
                fullWidth
                size='large'
                onClick={() => {
                  if (isTeacher || !courseId) return
                  const params = new URLSearchParams({
                    courseId: String(courseId),
                    courseName: course.title,
                    price: String(course.price),
                    thumbnail: course.thumbnail_url ?? ''
                  })
                  router.replace(`/authenticated/course/${courseId}/payment/confirm?${params}`)
                }}
                disabled={course?.isEnrolled === true}
                sx={{
                  bgcolor: '#ffd700',
                  color: '#000',
                  fontWeight: 'bold',
                  py: 1.5,
                  mb: 3,
                  '&:hover': { bgcolor: '#ffed4e' }
                }}
              >
                {course?.isEnrolled ? (isTeacher ? course.price : 'Already Enrolled') : 'Enroll now'}
              </Button>
              <Divider />
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant='h6' fontWeight='bold' gutterBottom>
                General information
              </Typography>
              {course.short_description && (
                <Typography variant='body1' color='text.secondary' sx={{ mb: 2, fontWeight: 500 }} textAlign='justify'>
                  {course.short_description}
                </Typography>
              )}
            </Paper>
          </Box>
        </Box>

        {isTeacher && (
          <>
            <ChapterModal
              open={chapterModalOpen}
              onClose={() => {
                setChapterModalOpen(false)
                setEditingChapter(null)
              }}
              onSubmit={handleChapterSubmit}
              editingChapter={editingChapter}
              loading={creatingChapter || updatingChapter}
              error={createChapterError || updateChapterError}
            />
            <LessonModal
              open={lessonModalOpen}
              onClose={() => {
                setLessonModalOpen(false)
                setEditingLesson(null)
              }}
              onSubmit={handleLessonSubmit}
              editingLesson={editingLesson}
              loading={creatingLesson || updatingLesson}
              error={createLessonError || updateLessonError}
            />
            <ConfirmModal
              open={confirmDialog.open}
              onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
              onConfirm={confirmDialog.onConfirm}
              title={confirmDialog.title}
              description={confirmDialog.description}
              confirmLabel='Delete'
              variant='danger'
              loading={deletingChapter || deletingLesson}
            />
          </>
        )}

        <Snackbar
          open={toast.open}
          autoHideDuration={2500}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={toast.severity}
            variant='filled'
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}
