'use client'

import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  Skeleton,
  Stack,
  Typography
} from '@mui/material'
import { CheckCircleOutline, SchoolOutlined } from '@mui/icons-material'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import api from '@/api/api'
import { authUtils } from '@/utils/auth'
import { useAlert } from '@/components/Alert'
interface CourseInfo {
  id: string
  name: string
  price: number
  thumbnail: string
}

interface UserData {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  avt_url: string
}

function useCourseFromParams(): {
  course: CourseInfo | null
  loading: boolean
} {
  const searchParams = useSearchParams()
  const [course, setCourse] = useState<CourseInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = searchParams.get('courseId')
    const name = searchParams.get('courseName') ?? 'Course'
    const price = Number(searchParams.get('price') ?? 0)
    const thumbnail = searchParams.get('thumbnail') ?? ''
    setCourse({ id: id ?? '', name, price, thumbnail })
    setLoading(false)
  }, [searchParams])

  return { course, loading }
}

export default function ConfirmEnrollPage() {
  const router = useRouter()
  const { course, loading } = useCourseFromParams()
  const { course_id } = useParams()
  const [confirming, setConfirming] = useState(false)
  const { userData }: { userData: UserData | null } = authUtils.getAuth()
  const { showAlert } = useAlert()
  const handleConfirm = async () => {
    if (!course) return
    setConfirming(true)

    try {
      const baseUrl = window.location.origin
      const payload = {
        description: `Thanh toan khoa hoc`,
        buyerName: `${userData?.first_name ?? ''} ${userData?.last_name ?? ''}`.trim(),
        buyerEmail: userData?.email,
        items: [
          {
            name: course.name,
            quantity: 1,
            price: course.price,
            unit: 'course',
            taxPercentage: 0
          }
        ],
        cancelUrl: `${baseUrl}/authenticated/course/${course.id}`,
        returnUrl: `${baseUrl}/authenticated/course/${course.id}`,
        invoice: {
          buyerNotGetInvoice: true,
          taxPercentage: 0
        }
      }

      const res = await api.post(`/media/payment/${course.id}/create`, payload)
      showAlert('Redirecting to payment page...', 'success')
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl
      }
    } catch (err: any) {
      setConfirming(false)
      showAlert('An error occurred, please try again', 'error')
    }
  }
  return (
    <Container maxWidth='sm' sx={{ py: 6, bgcolor: '#FFFEFC', minHeight: '100vh' }}>
      <Typography variant='h5' fontWeight={600} mb={1} color='#252641'>
        Confirm Course Enrollment
      </Typography>
      <Typography variant='body2' color='#252641' mb={3} sx={{ opacity: 0.7 }}>
        Please review the information before payment
      </Typography>

      <Card
        variant='outlined'
        sx={{
          borderRadius: '2em',
          border: '2px solid #FFCC00',
          boxShadow: '0 4px 12px rgba(255, 204, 0, 0.15)',
          mb: 2,
          p: 3,
          bgcolor: '#FFFFFF'
        }}
      >
        <Typography variant='subtitle2' fontWeight={600} color='#252641' mb={2}>
          Buyer Information
        </Typography>

        <Stack direction='row' spacing={2} alignItems='center'>
          <Stack spacing={0.5} flex={1} minWidth={0}>
            <Typography variant='body1' fontWeight={600} color='#252641' noWrap>
              {userData ? (
                `${userData.first_name} ${userData.last_name}`
              ) : (
                <Skeleton width={140} sx={{ bgcolor: '#FFF9CC' }} />
              )}
            </Typography>
            <Typography variant='body2' color='#252641' sx={{ opacity: 0.65 }} noWrap>
              {userData?.email ?? <Skeleton width={180} sx={{ bgcolor: '#FFF9CC' }} />}
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* ── Course Card ── */}
      <Card
        variant='outlined'
        sx={{
          borderRadius: '2em',
          overflow: 'hidden',
          border: '2px solid #FFCC00',
          boxShadow: '0 4px 12px rgba(255, 204, 0, 0.15)'
        }}
      >
        {/* Thumbnail */}
        {loading ? (
          <Skeleton variant='rectangular' height={200} sx={{ bgcolor: '#FFF9CC' }} />
        ) : course?.thumbnail ? (
          <CardMedia
            component='img'
            height={200}
            image={course.thumbnail}
            alt={course.name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 200,
              bgcolor: '#FFF9CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <Image src='/images/no_image.jpg' alt='No image available' fill style={{ objectFit: 'cover' }} />
          </Box>
        )}

        <Box sx={{ p: 3, bgcolor: '#FFFFFF' }}>
          {loading ? (
            <>
              <Skeleton width='70%' height={32} sx={{ bgcolor: '#FFF9CC' }} />
              <Skeleton width='100%' sx={{ bgcolor: '#FFF9CC' }} />
            </>
          ) : (
            <Typography variant='h6' fontWeight={600} mb={1} color='#252641'>
              {course?.name}
            </Typography>
          )}

          <Divider sx={{ my: 2, borderColor: '#FFCC00' }} />

          {/* Payment details */}
          <Stack spacing={1.5}>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='body2' color='#252641' sx={{ opacity: 0.7 }}>
                Course Price
              </Typography>
              {loading ? (
                <Skeleton width={80} sx={{ bgcolor: '#FFF9CC' }} />
              ) : (
                <Typography variant='body1' fontWeight={500} color='#252641'>
                  ${course?.price.toLocaleString('en-US')}
                </Typography>
              )}
            </Stack>

            <Divider sx={{ borderColor: '#FFCC00' }} />

            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='body1' fontWeight={600} color='#252641'>
                Total Payment
              </Typography>
              {loading ? (
                <Skeleton width={100} sx={{ bgcolor: '#FFF9CC' }} />
              ) : (
                <Typography variant='h6' fontWeight={700} color='#FFCC00'>
                  ${course?.price.toLocaleString('en-US')}
                </Typography>
              )}
            </Stack>
          </Stack>

          {/* Benefits */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: '#FFF9CC',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: '#FFCC00'
            }}
          >
            <Stack spacing={0.5}>
              {['Lifetime Access', 'Learn Anytime, Anywhere'].map((item) => (
                <Stack key={item} direction='row' spacing={1} alignItems='center'>
                  <CheckCircleOutline sx={{ fontSize: 16, color: '#FFCC00' }} />
                  <Typography variant='body2' color='#252641' fontWeight={500}>
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction='row' spacing={2} mt={3}>
            <Button
              variant='outlined'
              fullWidth
              onClick={() => router.back()}
              disabled={confirming}
              sx={{
                borderColor: '#FFCC00',
                borderRadius: { xs: 4, md: 8 },
                color: '#252641',
                fontWeight: 600,
                '&:hover': { borderColor: '#FFCC00', bgcolor: '#FFF9CC' }
              }}
            >
              Go Back
            </Button>
            <Button
              variant='contained'
              fullWidth
              onClick={handleConfirm}
              disabled={loading || confirming}
              startIcon={confirming ? <CircularProgress size={18} color='inherit' /> : null}
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                borderRadius: { xs: 4, md: 8 },
                py: { xs: 1.5, md: 2 },
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', md: '1rem' },
                '&:hover': { backgroundColor: '#FFC700' },
                '&:disabled': {
                  bgcolor: '#FFF9CC',
                  color: '#252641',
                  opacity: 0.6
                }
              }}
            >
              {confirming ? 'Processing...' : 'Confirm & Pay'}
            </Button>
          </Stack>

          <Typography
            variant='caption'
            color='#252641'
            textAlign='center'
            display='block'
            mt={1.5}
            sx={{ opacity: 0.5 }}
          >
            You will be redirected to the secure PayOS payment page
          </Typography>
        </Box>
      </Card>
    </Container>
  )
}
