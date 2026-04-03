'use client'
import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Button, IconButton, Grid, Skeleton, Alert, Snackbar } from '@mui/material'
import { Plus, MoreHorizontal, RefreshCw } from 'lucide-react'

import CourseCard from '@/components/instructor/courses/CourseCard'
import CourseModal from '@/components/instructor/courses/CourseModal'
import DeleteDialog from '@/components/instructor/courses/DeleteDialog'

import { useCreateCourse, useUpdateCourse, useDeleteCourse } from '@/hooks/useCourses'
import { getCoursesByOwner } from '@/api/courses/courseApi'
import type { CourseEntity, CreateCourseDto, UpdateCourseDto } from '@/api/courses/types'

// ─── TODO: thay bằng owner_id thật từ auth session ───────────────────────────
const OWNER_ID = '019bfef8-084e-7ce2-aed8-c990c41d7045'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CourseCardSkeleton() {
  return (
    <Box sx={{ border: '1.5px solid #e8edf2', borderRadius: '14px', p: '20px 22px', backgroundColor: '#fff' }}>
      <Skeleton variant='rounded' width={70} height={22} sx={{ mb: 1.5, borderRadius: '8px' }} />
      <Skeleton variant='text' sx={{ fontSize: '1rem', mb: 0.5 }} />
      <Skeleton variant='text' sx={{ fontSize: '1rem', width: '65%', mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 3, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
        <Skeleton variant='text' width={60} />
        <Skeleton variant='text' width={60} />
      </Box>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseEntity[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseEntity | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState<CourseEntity | null>(null)

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const { create, loading: createLoading, error: createError } = useCreateCourse()
  const { update, loading: updateLoading, error: updateError } = useUpdateCourse()
  const { remove, loading: deleteLoading } = useDeleteCourse()

  // ── Load danh sách ──────────────────────────────────────────────────────────
  const loadCourses = useCallback(async () => {
    setListLoading(true)
    setListError(null)
    try {
      const res = await getCoursesByOwner(OWNER_ID)
      console.log('Fetched courses:', res.data) // Debug log
      // backend có thể trả data là array hoặc object có items
      const list = Array.isArray(res.data) ? res.data : res.data.courses
      setCourses(list)
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Không thể tải danh sách khóa học')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const showToast = (message: string, severity: 'success' | 'error' = 'success') =>
    setToast({ open: true, message, severity })

  const openAdd = () => {
    setEditingCourse(null)
    setModalOpen(true)
  }
  const openEdit = (course: CourseEntity) => {
    setEditingCourse(course)
    setModalOpen(true)
  }
  const openDelete = (id: string) => {
    setDeletingCourse(courses.find((c) => c.id === id) ?? null)
    setDeleteOpen(true)
  }

  // ── Create / Update ─────────────────────────────────────────────────────────
  async function handleSubmit(data: CreateCourseDto | UpdateCourseDto) {
    if (editingCourse) {
      const updated = await update(editingCourse.id, data as UpdateCourseDto)
      if (updated) {
        setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        setModalOpen(false)
        showToast('Cập nhật khóa học thành công')
      }
    } else {
      const created = await create({ ...(data as CreateCourseDto), owner_id: OWNER_ID })
      if (created) {
        setCourses((prev) => [created, ...prev])
        setModalOpen(false)
        showToast('Tạo khóa học thành công')
      }
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deletingCourse) return
    const ok = await remove(deletingCourse.id)
    if (ok) {
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id))
      setDeleteOpen(false)
      showToast('Đã xóa khóa học')
    } else {
      showToast('Xóa thất bại', 'error')
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: '28px 32px' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#111827', letterSpacing: '-0.02em' }}>
            Courses
          </Typography>
          {!listLoading && (
            <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', mt: 0.3 }}>{courses.length} khóa học</Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            onClick={loadCourses}
            disabled={listLoading}
            variant='outlined'
            startIcon={<RefreshCw size={14} />}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              borderColor: '#e2e8f0',
              color: '#64748b',
              px: 2,
              py: 1,
              '&:hover': { borderColor: '#94a3b8', backgroundColor: '#f8fafc' }
            }}
          >
            Refresh
          </Button>
          <Button
            variant='contained'
            startIcon={<Plus size={16} />}
            onClick={openAdd}
            sx={{
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              px: 2.5,
              py: 1.1,
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              '&:hover': { backgroundColor: '#1d4ed8' }
            }}
          >
            Add Course
          </Button>
          <IconButton
            sx={{
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              backgroundColor: '#fff',
              color: '#64748b',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
          >
            <MoreHorizontal size={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Error */}
      {listError && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setListError(null)}>
          {listError}
        </Alert>
      )}

      {/* Grid */}
      <Grid container spacing={2.5}>
        {listLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
              <CourseCardSkeleton />
            </Grid>
          ))
        ) : courses.length === 0 ? (
          <Grid size={12}>
            <Box sx={{ textAlign: 'center', py: 12, color: '#94a3b8' }}>
              <Box sx={{ fontSize: '3rem', mb: 2 }}>📚</Box>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', mb: 0.5 }}>
                Chưa có khóa học nào
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', mb: 3 }}>Tạo khóa học đầu tiên của bạn để bắt đầu.</Typography>
              <Button
                variant='contained'
                startIcon={<Plus size={16} />}
                onClick={openAdd}
                sx={{
                  backgroundColor: '#2563eb',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
                  '&:hover': { backgroundColor: '#1d4ed8' }
                }}
              >
                Add Course
              </Button>
            </Box>
          </Grid>
        ) : (
          courses.map((course) => (
            <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <CourseCard course={course} onEdit={openEdit} onDelete={openDelete} />
            </Grid>
          ))
        )}
      </Grid>

      {/* Add / Edit modal */}
      <CourseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editingCourse={editingCourse}
        loading={createLoading || updateLoading}
        error={createError || updateError}
      />

      {/* Delete dialog */}
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        courseName={deletingCourse?.title}
      />

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          sx={{ borderRadius: '12px', fontWeight: 600 }}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
