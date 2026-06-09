'use client'

import CoursesWithGeneralInfo, { RecommendedCourse } from '@/components/CoursesWithGeneralInfo'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Box, Pagination, Typography, Skeleton, Stack, Button, Alert } from '@mui/material'
import { styled } from '@mui/material/styles'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import { authUtils } from '@/utils/auth'
import type { CreateCourseDto, UpdateCourseDto } from '@/api/courses/types'
import {
  useInstructorCourses,
  useEnrolledCourses,
  useCreateCourse,
  useDeleteCourse,
  useUpdateCourse
} from '@/hooks/useCourses'
import CourseModal from '@/components/instructor/courses/CourseModal'
import DeleteDialog from '@/components/instructor/courses/DeleteDialog'
import { useState } from 'react'
import { useAlert } from '@/components/Alert'

const ITEMS_PER_PAGE = 12

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#FAF9F4',
  paddingBottom: theme.spacing(8)
}))

export const HeaderSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(5, 4, 3),
  maxWidth: 1280,
  margin: '0 auto',
  borderBottom: '1px solid #E5E7EB',
  marginBottom: theme.spacing(4)
}))

const ContentSection = styled(Box)(() => ({
  maxWidth: 1280,
  margin: '0 auto',
  padding: '0 32px'
}))

const PaginationWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(2)
}))

const EmptyState = () => (
  <Box
    sx={{
      width: 260,
      height: 260,
      margin: '80px auto 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      bgcolor: '#FFF9CC',
      textAlign: 'center',
      px: 3,
      boxShadow: '0 12px 40px #FFF9CC'
    }}
  >
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 1
      }}
    >
      <SchoolOutlinedIcon sx={{ fontSize: 28, color: '#C0C4CC' }} />
    </Box>
    <Typography variant='body2' fontWeight={500} color='#6B7280' sx={{ mb: 0.5 }}>
      No courses yet
    </Typography>
    <Typography variant='caption' color='#9CA3AF' sx={{ maxWidth: 180, lineHeight: 1.4 }}>
      You haven't enrolled in any courses
    </Typography>
  </Box>
)

const paginationSx = {
  mt: 2,
  '& .MuiPaginationItem-root': { color: '#374151', border: '1px solid #E5E7EB' },
  '& .MuiPaginationItem-root:hover': { backgroundColor: '#F3F4F6' },
  '& .Mui-selected': { backgroundColor: '#FFD600 !important', color: '#000', border: 'none' }
}

interface CoursePaginationProps {
  meta: { totalItems: number; totalPages: number; itemsPerPage: number; currentPage: number }
  onChange: (_: React.ChangeEvent<unknown>, page: number) => void
}

const CoursePagination = ({ meta, onChange }: CoursePaginationProps) => {
  if (meta.totalPages <= 1) return null
  const rangeStart = (meta.currentPage - 1) * meta.itemsPerPage + 1
  const rangeEnd = Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)
  return (
    <PaginationWrapper>
      <Pagination
        count={meta.totalPages}
        page={meta.currentPage}
        onChange={onChange}
        showFirstButton
        showLastButton
        sx={paginationSx}
      />
      <Typography variant='caption' color='#9CA3AF'>
        Showing {rangeStart}–{rangeEnd} of {meta.totalItems} courses
      </Typography>
    </PaginationWrapper>
  )
}

export default function MyCoursesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { showAlert } = useAlert()
  const currentOffset = Math.max(1, Number(searchParams.get('offset') ?? '1'))

  const { userData } = authUtils.getAuth()
  const userId = String(userData?.id ?? '')
  const isTeacher = String(userData?.role || '').toLowerCase() === 'teacher'

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CreateCourseDto | UpdateCourseDto | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingCourse, setDeletingCourse] = useState<RecommendedCourse | null>(null)

  const teachingOffset = isTeacher ? currentOffset : 1
  const studentOffset = !isTeacher ? currentOffset : 1

  const studentEnrolled = useEnrolledCourses(!isTeacher ? userId : '', studentOffset, ITEMS_PER_PAGE)

  const {
    courses: teachingCourses,
    setCourses: setTeachingCourses,
    meta: teachingMeta,
    loading: teachingLoading,
    error: teachingError
  } = useInstructorCourses(isTeacher ? userId : '', teachingOffset, ITEMS_PER_PAGE)

  const { create, loading: createLoading, error: createError } = useCreateCourse()
  const { update, loading: updateLoading, error: updateError } = useUpdateCourse()
  const { remove, loading: deleteLoading } = useDeleteCourse()

  const activeCourses = isTeacher ? teachingCourses : studentEnrolled.courses
  const activeMeta = isTeacher ? teachingMeta : studentEnrolled.meta
  const activeLoading = isTeacher ? teachingLoading : studentEnrolled.loading

  const mappedTeachingCourses = teachingCourses.map((course) => ({
    ...course,
    duration: '--',
    user: { name: userData?.name || 'Instructor', avatar_url: userData?.avt_url || '' }
  }))

  const displayCourses = isTeacher ? mappedTeachingCourses : activeCourses
  const isEmpty = !activeLoading && activeCourses.length === 0

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('offset', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  const openAdd = () => {
    setEditingCourse(null)
    setModalOpen(true)
  }

  const openEdit = (course: CreateCourseDto | UpdateCourseDto) => {
    setEditingCourse(course)
    setModalOpen(true)
  }

  const openDelete = (courseId: string) => {
    setDeletingCourse(teachingCourses.find((c) => c.id === courseId) ?? null)
    setDeleteOpen(true)
  }

  const goToCourseDetail = (courseId: string) => router.push(`/authenticated/course/${courseId}`)

  async function handleSubmit(data: CreateCourseDto | UpdateCourseDto) {
    if (!isTeacher) return
    if (editingCourse) {
      const updateData = { ...(data as UpdateCourseDto) }
      delete (updateData as any).owner_id
      Object.keys(updateData).forEach((key) => {
        const value = (updateData as any)[key]
        if (value === '' || value === undefined) delete (updateData as any)[key]
      })
      if (!editingCourse.id) return
      const updated = await update(editingCourse.id, updateData)
      if (updated) {
        setTeachingCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        setModalOpen(false)
        showAlert('Cập nhật khóa học thành công', 'success', { vertical: 'bottom', horizontal: 'left' })
      }
      return
    }
    const created = await create({ ...(data as CreateCourseDto), owner_id: userId })
    if (created) {
      setTeachingCourses((prev) => [created, ...prev])
      setModalOpen(false)
      showAlert('Tạo khóa học thành công', 'success', { vertical: 'bottom', horizontal: 'left' })
    }
  }

  async function handleDelete() {
    if (!deletingCourse) return
    const ok = await remove(deletingCourse.id)
    if (ok) {
      setTeachingCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id))
      setDeleteOpen(false)
      showAlert('Đã xóa khóa học', 'success', { vertical: 'bottom', horizontal: 'left' })
    } else {
      showAlert('Xóa thất bại', 'error', { vertical: 'bottom', horizontal: 'left' })
    }
  }

  return (
    <PageWrapper>
      <HeaderSection>
        <Typography variant='h4' fontWeight={700} gutterBottom color='#111827'>
          {isTeacher ? 'My Courses (Teacher)' : 'My Courses'}
        </Typography>

        {isTeacher ? (
          <Stack direction='row' alignItems='center' justifyContent='space-between' gap={2} flexWrap='wrap'>
            <Typography variant='body2' color='text.secondary'>
              {activeMeta.totalItems} courses
            </Typography>
            <Button
              variant='contained'
              onClick={openAdd}
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
              Add Course
            </Button>
          </Stack>
        ) : activeLoading ? (
          <Skeleton width={180} height={22} />
        ) : (
          <Typography variant='body2' color='#6B7280'>
            {activeMeta.totalItems} courses · Page {activeMeta.currentPage}/{activeMeta.totalPages}
          </Typography>
        )}
      </HeaderSection>

      <ContentSection>
        {isTeacher && teachingError && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
            {teachingError}
          </Alert>
        )}
        {isEmpty ? (
          <EmptyState />
        ) : (
          <CoursesWithGeneralInfo
            loading={activeLoading}
            courses={displayCourses as RecommendedCourse[]}
            showPrice={false}
            visualPreset={isTeacher ? 'course-detail' : 'default'}
            teacherMode={isTeacher}
            manageLabel='Manage'
            courseHrefBuilder={isTeacher ? (item) => `/authenticated/course/${item.id}` : undefined}
            onManageCourse={isTeacher ? (item) => goToCourseDetail(item.id) : undefined}
            onEditCourse={isTeacher ? (item) => openEdit(item as CreateCourseDto) : undefined}
            onDeleteCourse={isTeacher ? (item) => openDelete(item.id) : undefined}
          />
        )}
      </ContentSection>

      {!activeLoading && <CoursePagination meta={activeMeta} onChange={handlePageChange} />}

      {isTeacher && (
        <>
          <CourseModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSubmit}
            editingCourse={editingCourse}
            ownerId={userId}
            loading={createLoading || updateLoading}
            error={createError || updateError}
          />
          <DeleteDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
            loading={deleteLoading}
            courseName={deletingCourse?.title}
          />
        </>
      )}
    </PageWrapper>
  )
}
