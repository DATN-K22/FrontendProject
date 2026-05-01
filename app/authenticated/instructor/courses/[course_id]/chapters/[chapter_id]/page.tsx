'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Box, Typography, Button, IconButton, Grid, Alert, Snackbar } from '@mui/material'
import { Plus, RefreshCw, ArrowLeft, FolderOpen } from 'lucide-react'
import { useLessonsByChapter, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/useLessons'
import LessonModal from '@/components/instructor/courses/LessonModal'
import ResourceModal from '@/components/instructor/courses/ResourceModal'

export default function LessonsPage() {
  const { course_id, chapter_id } = useParams()
  const router = useRouter()
  const { lessons, loading, error, fetchLessons, setLessons } = useLessonsByChapter(chapter_id)
  const { create, loading: createLoading, error: createError } = useCreateLesson()
  const { update, loading: updateLoading, error: updateError } = useUpdateLesson()
  const { remove, loading: deleteLoading } = useDeleteLesson()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [resourceModalOpen, setResourceModalOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchLessons()
  }, [chapter_id])

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity })

  const openAdd = () => {
    setEditingLesson(null)
    setModalOpen(true)
  }
  const openEdit = (lesson) => {
    setEditingLesson(lesson)
    setModalOpen(true)
  }
  const handleDelete = async (id) => {
    const ok = await remove(id)
    if (ok) {
      setLessons((prev) => prev.filter((l) => l.id !== id))
      showToast('Đã xóa lesson')
    } else showToast('Xóa thất bại', 'error')
  }

  async function handleSubmit(data) {
    if (editingLesson) {
      // Loại bỏ trường id khỏi payload update
      const { id, ...updateData } = data
      const updated = await update(editingLesson.id, updateData)
      if (updated) {
        setLessons((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
        setModalOpen(false)
        showToast('Cập nhật lesson thành công')
      }
    } else {
      const created = await create({ ...data, chapter_id: String(chapter_id) })
      if (created) {
        setLessons((prev) => [created, ...prev])
        setModalOpen(false)
        showToast('Tạo lesson thành công')
      }
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Nút back */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push(`/authenticated/instructor/courses/${course_id}/chapters`)}>
          <ArrowLeft size={22} />
        </IconButton>
        <Typography variant='h5' fontWeight={700} sx={{ ml: 1 }}>
          Lessons
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={fetchLessons} disabled={loading} startIcon={<RefreshCw size={14} />}>
            Refresh
          </Button>
          <Button variant='contained' startIcon={<Plus size={16} />} onClick={openAdd}>
            Add Lesson
          </Button>
        </Box>
      </Box>
      {error && <Alert severity='error'>{error}</Alert>}
      <Grid container spacing={2}>
        {lessons.map((lesson) => (
          <Grid item xs={12} md={6} key={lesson.id}>
            <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2, bgcolor: '#fff' }}>
              <Typography fontWeight={600}>{lesson.title}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Status: {lesson.status}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Type: {lesson.type}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Sort: {lesson.sort_order}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button size='small' onClick={() => openEdit(lesson)}>
                  Edit
                </Button>
                <Button size='small' color='primary' onClick={() => { setSelectedLesson(lesson); setResourceModalOpen(true); }} startIcon={<FolderOpen size={14} />}>
                  Resources
                </Button>
                <Button size='small' color='error' onClick={() => handleDelete(lesson.id)}>
                  Delete
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      <LessonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editingLesson={editingLesson}
        loading={createLoading || updateLoading}
        error={createError || updateError}
      />
      <ResourceModal
        open={resourceModalOpen}
        onClose={() => setResourceModalOpen(false)}
        lessonId={selectedLesson?.id}
        courseId={course_id as string}
        lessonTitle={selectedLesson?.title || ''}
      />
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  )
}
