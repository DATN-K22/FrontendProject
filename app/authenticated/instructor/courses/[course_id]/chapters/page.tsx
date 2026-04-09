'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Box, Typography, Button, IconButton, Grid, Alert, Snackbar } from '@mui/material'
import { Plus, RefreshCw } from 'lucide-react'
import { useChaptersByCourse, useCreateChapter, useUpdateChapter, useDeleteChapter } from '@/hooks/useChapters'
import ChapterModal from '@/components/instructor/courses/ChapterModal'

export default function ChaptersPage() {
  const { course_id } = useParams()
  const { chapters, loading, error, refetch, setChapters } = useChaptersByCourse(course_id)
  const { create, loading: createLoading, error: createError } = useCreateChapter()
  const { update, loading: updateLoading, error: updateError } = useUpdateChapter()
  const { remove, loading: deleteLoading } = useDeleteChapter()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingChapter, setEditingChapter] = useState(null)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity })

  const openAdd = () => {
    setEditingChapter(null)
    setModalOpen(true)
  }
  const openEdit = (chapter) => {
    setEditingChapter(chapter)
    setModalOpen(true)
  }
  const handleDelete = async (id) => {
    const ok = await remove(id)
    if (ok) {
      setChapters((prev) => prev.filter((c) => c.id !== id))
      showToast('Đã xóa chapter')
    } else showToast('Xóa thất bại', 'error')
  }

  async function handleSubmit(data) {
    if (editingChapter) {
      // Chỉ lấy các trường cần thiết khi update
      const updateData = {
        title: data.title,
        status: data.status,
        sort_order: data.sort_order
      }
      const updated = await update(editingChapter.id, updateData)
      if (updated) {
        setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        setModalOpen(false)
        showToast('Cập nhật chapter thành công')
      }
    } else {
      // Khi tạo mới, truyền course_id là số
      const created = await create({ ...data, course_id: Number(course_id) })
      if (created) {
        setChapters((prev) => [created, ...prev])
        setModalOpen(false)
        showToast('Tạo chapter thành công')
      }
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant='h5' fontWeight={700}>
          Chapters
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={refetch} disabled={loading} startIcon={<RefreshCw size={14} />}>
            Refresh
          </Button>
          <Button variant='contained' startIcon={<Plus size={16} />} onClick={openAdd}>
            Add Chapter
          </Button>
        </Box>
      </Box>
      {error && <Alert severity='error'>{error}</Alert>}
      <Grid container spacing={2}>
        {chapters.map((chapter) => (
          <Grid item xs={12} md={6} key={chapter.id}>
            <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 2, p: 2, bgcolor: '#fff' }}>
              <Typography fontWeight={600}>{chapter.title}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Status: {chapter.status}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Sort: {chapter.sort_order}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button size='small' onClick={() => openEdit(chapter)}>
                  Edit
                </Button>
                <Button size='small' color='error' onClick={() => handleDelete(chapter.id)}>
                  Delete
                </Button>
              </Box>
              {/* Hiển thị lesson nếu muốn */}
            </Box>
          </Grid>
        ))}
      </Grid>
      <ChapterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editingChapter={editingChapter}
        loading={createLoading || updateLoading}
        error={createError || updateError}
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
