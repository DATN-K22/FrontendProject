import { Avatar, Box, Button, Grid, IconButton, Skeleton, Tooltip, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useScrollRevealList } from '@/hooks/useScrollRevealList'
import StarIcon from '@mui/icons-material/Star'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined'
import { CourseStatus } from '@/api/courses/types'

export type RecommendedCourse = {
  id: string
  thumbnail_url: string
  title: string
  course_level: CourseLevel
  short_description: string
  long_description?: string
  user: {
    name: string
    avt_url: string
  }
  rating: number
  price: number
  status: CourseStatus
}

export enum CourseLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Expert = 'Expert',
  AllLevels = 'All Levels'
}

export default function CoursesWithGeneralInfo({
  loading,
  courses,
  showPrice = true,
  visualPreset = 'default',
  courseHrefBuilder,
  teacherMode = false,
  onEditCourse,
  onDeleteCourse,
  onManageCourse,
  manageLabel = 'Manage'
}: {
  loading: boolean
  courses: any[] | null
  showPrice?: boolean
  visualPreset?: 'default' | 'course-detail'
  courseHrefBuilder?: (course: any) => string
  teacherMode?: boolean
  onEditCourse?: (course: any) => void
  onDeleteCourse?: (course: any) => void
  onManageCourse?: (course: any) => void
  manageLabel?: string
}) {
  const skeletonArray = Array.from({ length: 4 })
  const router = useRouter()
  const { setItemRef, getItemStyle, durationMs, easing } = useScrollRevealList({
    direction: 'left',
    enableOpacity: false,
    enableScrollProgress: true
  })

  const cardSx = {
    borderRadius: 4,
    boxShadow: loading || !courses ? '0 2px 12px rgba(0,0,0,0.1)' : '0 2px 12px rgba(0,0,0,0.3)',
    border: 'none',
    bgcolor: '#fff',
    p: 2.5,
    display: 'flex',
    width: '100%',
    flexDirection: 'column' as const,
    height: '100%',
    position: 'relative' as const,
    textAlign: 'left' as const,
    transition: 'all 0.3s ease',
    cursor: loading || !courses ? 'default' : 'pointer'
  }

  const hoverSx = {
    '&:hover': {
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      transform: 'translateY(-4px)',
      cursor: 'pointer'
    }
  }

  const manageButtonSx = {
    textTransform: 'none',
    borderRadius: 2,
    color: '#151312',
    backgroundColor: '#FFE08A',
    fontWeight: 600,
    px: 1.2,
    py: 0.25,
    minWidth: 'fit-content',
    '&:hover': { backgroundColor: '#FFD95A' }
  }

  return (
    <Box
      ref={setItemRef(0)}
      sx={{
        transition: `transform ${durationMs}ms ${easing}, opacity 240ms linear`,
        ...getItemStyle(0)
      }}
    >
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        {(loading || !courses ? skeletonArray : courses).map((item: any, index: number) => {
          const isSkeleton = loading || !courses

          return (
            <Grid key={isSkeleton ? index : item.id} size={{ xs: 4, sm: 4, md: 3 }}>
              <Box
                component='div'
                onClick={
                  isSkeleton
                    ? undefined
                    : () =>
                        router.push(courseHrefBuilder ? courseHrefBuilder(item) : `/authenticated/course/${item.id}`)
                }
                sx={{
                  ...cardSx,
                  transition: 'all 0.3s ease',
                  ...(isSkeleton ? {} : hoverSx)
                }}
              >
                {!isSkeleton && teacherMode && (onEditCourse || onDeleteCourse) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 18,
                      right: 18,
                      display: 'flex',
                      gap: 0.75,
                      zIndex: 2
                    }}
                  >
                    {onEditCourse && (
                      <Tooltip title='Edit' arrow>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditCourse(item)
                          }}
                          sx={{
                            width: 30,
                            height: 30,
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            border: '1px solid #eee',
                            '&:hover': { backgroundColor: '#fff5cc', color: '#a16207' }
                          }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDeleteCourse && (
                      <Tooltip title='Delete' arrow>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteCourse(item)
                          }}
                          sx={{
                            width: 30,
                            height: 30,
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            border: '1px solid #eee',
                            '&:hover': { backgroundColor: '#fee2e2', color: '#dc2626' }
                          }}
                        >
                          <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                )}

                {/* Thumbnail */}
                {isSkeleton ? (
                  <Skeleton variant='rectangular' height={200} sx={{ borderRadius: 3, mb: 2 }} />
                ) : (
                  <Box
                    component='img'
                    src={item.thumbnail_url?.trim() ? item.thumbnail_url : '/images/no_image.jpg'}
                    alt={item.title}
                    sx={{
                      borderRadius: 3,
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      mb: 2
                    }}
                  />
                )}

                {/* Category + Duration */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1.5
                  }}
                >
                  {isSkeleton ? (
                    <>
                      <Skeleton width='30%' height={20} />
                      <Skeleton width='20%' height={20} />
                    </>
                  ) : (
                    <>
                      <Typography
                        fontSize='0.875rem'
                        color='#999'
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <StarIcon sx={{ fontSize: 23, color: '#f5c518' }} />
                        {item.rating ?? 0}
                      </Typography>
                      <Typography fontSize='0.875rem' color='#999'>
                        {item.duration}
                      </Typography>
                    </>
                  )}
                </Box>

                {/* Title */}
                {isSkeleton ? (
                  <>
                    <Skeleton height={28} />
                    <Skeleton width='80%' height={28} sx={{ mb: 1.5 }} />
                  </>
                ) : (
                  <Typography
                    fontWeight={600}
                    fontSize='1.125rem'
                    textAlign='justify'
                    sx={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2
                    }}
                    overflow='hidden'
                    mb={1.5}
                  >
                    {item.title}
                  </Typography>
                )}

                {/* Description */}
                {isSkeleton ? (
                  <>
                    <Skeleton height={18} />
                    <Skeleton height={18} />
                    <Skeleton width='70%' height={18} sx={{ mb: 2 }} />
                  </>
                ) : (
                  <Typography
                    fontSize='0.875rem'
                    color='#666'
                    mb={2}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                    textAlign='justify'
                  >
                    {item.short_description}
                  </Typography>
                )}

                <Box sx={{ flexGrow: 1 }} />

                {/* Footer */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 2,
                    borderTop: '1px solid #f0f0f0'
                  }}
                >
                  {isSkeleton ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant='circular' width={32} height={32} sx={{ mr: 1 }} />
                        <Skeleton width={80} height={20} />
                      </Box>
                      <Skeleton width={60} height={28} />
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={item.user?.avatar_url?.trim() || undefined}
                          alt={item.user?.name ?? ''}
                          sx={{
                            bgcolor: '#151312',
                            width: 32,
                            height: 32,
                            mr: 1
                          }}
                        ></Avatar>
                        <Typography
                          fontSize='0.875rem'
                          overflow='hidden'
                          textAlign='justify'
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {item.user?.name ?? ''}
                        </Typography>
                      </Box>

                      {showPrice && (
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            color: '#FFD600'
                          }}
                        >
                          {item.price === 0 ? 'Free' : `${item.price.toLocaleString('en-US')} VND`}
                        </Typography>
                      )}

                      {!showPrice && teacherMode && onManageCourse && (
                        <Button
                          size='small'
                          startIcon={<LibraryBooksOutlinedIcon sx={{ fontSize: 16 }} />}
                          onClick={(e) => {
                            e.stopPropagation()
                            onManageCourse(item)
                          }}
                          sx={manageButtonSx}
                        >
                          {manageLabel}
                        </Button>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
