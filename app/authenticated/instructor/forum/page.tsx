'use client'
import { useEffect, useState } from 'react'
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material'
import { RefreshCw, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ForumCard from '@/components/instructor/forum/ForumCard'
import ForumModal from '@/components/instructor/forum/ForumModal'
import { useForumsByCourse, useCreateForum, useUpdateForum, useDeleteForum } from '@/hooks/useForums'

export default function ForumPage() {
  const router = useRouter()
  // Nếu muốn lọc theo course_id, truyền vào useForumsByCourse(course_id)
  const { forums, courses, loading, error, fetchForums, setForums } = useForumsByCourse()
  const { create, loading: createLoading, error: createError } = useCreateForum()
  const { update, loading: updateLoading, error: updateError } = useUpdateForum()
  const { remove, loading: deleteLoading } = useDeleteForum()

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingForum, setEditingForum] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    fetchForums()
  }, [])

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity })

  // Xử lý click vào forum (ví dụ: điều hướng sang trang chi tiết)
  const handleForumClick = (forum) => {
    router.push(`/authenticated/instructor/forum/${forum.id}`)
  }

  const openAdd = () => {
    setEditingForum(null)
    setModalOpen(true)
  }
  const openEdit = (forum) => {
    setEditingForum(forum)
    setModalOpen(true)
  }
  const openDelete = (id) => setDeleteId(id)

  async function handleSubmit(data) {
    if (editingForum) {
      const updated = await update(editingForum.id, data)
      if (updated) {
        setForums((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
        setModalOpen(false)
        showToast('Cập nhật forum thành công')
      }
    } else {
      // Kiểm tra xem diễn đàn cho khóa học này đã tồn tại chưa
      const alreadyHasForum = forums.some(
        (f) => String(f.course_id) === String(data.course_id) || String(f.course?.id) === String(data.course_id)
      )

      if (alreadyHasForum) {
        showToast('Khóa học này đã có diễn đàn, không thể tạo thêm!', 'error')
        return
      }

      const created = await create(data)
      if (created) {
        setForums((prev) => [created, ...prev])
        setModalOpen(false)
        showToast('Tạo forum thành công')
      }
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    const ok = await remove(deleteId)
    if (ok) {
      setForums((prev) => prev.filter((f) => f.id !== deleteId))
      setDeleteId(null)
      showToast('Đã xóa forum')
    } else {
      showToast('Xóa thất bại', 'error')
    }
  }

  return (
    <Box sx={{ p: '28px 32px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#111827', letterSpacing: '-0.02em' }}>
          Forum / Q&A
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={fetchForums} disabled={loading} startIcon={<RefreshCw size={14} />}>
            Refresh
          </Button>
          <Button variant='contained' startIcon={<Plus size={16} />} onClick={openAdd}>
            Add Forum
          </Button>
        </Box>
      </Box>
      {error && <Alert severity='error'>{error}</Alert>}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {forums.map((forum) => (
          <Box key={forum.id} sx={{ position: 'relative' }}>
            <ForumCard forum={forum} onClick={() => handleForumClick(forum)} />
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
              <Button size='small' onClick={() => openEdit(forum)}>
                Edit
              </Button>
              <Button size='small' color='error' onClick={() => openDelete(forum.id)}>
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
      <ForumModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editingForum={editingForum}
        loading={createLoading || updateLoading}
        error={createError || updateError}
        courses={courses}
      />
      {/* Xác nhận xóa đơn giản */}
      {deleteId && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: '#00000055',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ bgcolor: '#fff', p: 3, borderRadius: 2, minWidth: 300 }}>
            <Typography>Bạn có chắc muốn xóa forum này?</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button color='error' variant='contained' onClick={handleDelete} disabled={deleteLoading}>
                Delete
              </Button>
            </Box>
          </Box>
        </Box>
      )}
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
