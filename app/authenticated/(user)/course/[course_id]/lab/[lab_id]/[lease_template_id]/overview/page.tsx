'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  Chip,
  Skeleton,
  IconButton,
  CircularProgress,
  type ChipProps
} from '@mui/material'
import {
  AccessTime,
  CheckCircle,
  Cancel,
  Warning,
  CalendarToday,
  PlayCircle,
  HourglassEmpty,
  Schedule,
  Help,
  CalendarMonth
} from '@mui/icons-material'
import { LessonDetail } from '@/utils/dto/Lesson'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useParams, useRouter } from 'next/navigation'
import api from '@/api/api'
import { useAlert } from '@/components/Alert'
import { authUtils } from '@/utils/auth'

type LabHistoryStatus = 'complete' | 'fail' | 'timeout' | 'running' | 'unknown' | 'cancel' | 'provisioning' | 'pending'

type LabHistory = {
  uuid: string
  date: string
  status: LabHistoryStatus
  leaseDurationInHours: number
  templateName: string
  leaseId: string
}

// Map API status string → display status
const mapApiStatus = (apiStatus: string): LabHistoryStatus => {
  switch (apiStatus) {
    case 'Active':
      return 'running'

    case 'Provisioning':
      return 'provisioning'

    case 'Expired':
    case 'BudgetExceeded':
      return 'timeout'

    case 'ManuallyTerminated':
    case 'Ejected':
    case 'ApprovalDenied':
    case 'Frozen':
      return 'cancel'

    case 'Completed':
      return 'complete'

    case 'Error':
    case 'ProvisioningFailed':
    case 'AccountQuarantined':
      return 'fail'

    case 'PendingApproval':
      return 'pending' // hoặc tách thêm status nếu muốn hiển thị riêng

    default:
      return 'unknown'
  }
}

export default function LabOverview() {
  const { course_id, lab_id, lease_template_id } = useParams()
  const { userData } = authUtils.getAuth()
  const [labData, setLabData] = useState<LessonDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [labHistory, setLabHistory] = useState<LabHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [startLabLoading, setStartLabLoading] = useState(false)
  const { showAlert } = useAlert()
  const router = useRouter()

  useEffect(() => {
    fetchLabData()
    fetchLabHistory()
  }, [])

  const fetchLabData = async () => {
    try {
      const lessonResponse = await api.get(`/courses/lessons/${lab_id}/${userData?.id}`)
      const data: LessonDetail = lessonResponse.data.data
      setLabData(data)
    } catch (error) {
      console.error('Error fetching lab data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLabHistory = async () => {
    try {
      const response = await api.get(
        `/labs/leases/me?pageSize=10&userEmail=${userData.email}&leaseTemplateId=${lease_template_id}`
      )
      const result = response.data?.data?.result ?? []

      const mapped: LabHistory[] = result.map((item: any) => ({
        uuid: item.uuid,
        date: item.meta?.createdTime
          ? new Date(item.meta.createdTime).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '—',
        status: mapApiStatus(item.status),
        leaseDurationInHours: item.leaseDurationInHours ?? 1,
        templateName: item.originalLeaseTemplateName ?? '',
        leaseId: item.leaseId ?? ''
      }))

      setLabHistory(mapped)
    } catch (error) {
      console.error('Error fetching lab history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const activeSession = labHistory.find((item) => item.status === 'running')

  const handleStartLab = async () => {
    setStartLabLoading(true)
    try {
      let leaseSession
      if (!activeSession) {
        leaseSession = (
          await api.post('/labs/leases', {
            leaseTemplateUuid:
              labData?.leaseTemplateId !== '' ? labData?.leaseTemplateId : '0d741bd6-cb8d-406c-a981-e01a87c7b102',
            comments: `Started from course ${course_id}`,
            userEmail: userData.email
          })
        ).data.data

        showAlert('Lab started successfully!', 'success')
        router.push(
          `/authenticated/course/${course_id}/lab/${lab_id}/${lease_template_id}/start?leaseId=${leaseSession.leaseId}`
        )
      } else {
        router.push(
          `/authenticated/course/${course_id}/lab/${lab_id}/${lease_template_id}/start?leaseId=${activeSession.leaseId}`
        )
      }
    } catch (err) {
      console.error('Error starting lab:', err)
      showAlert('Failed to start lab. Please try again.', 'error')
    } finally {
      setStartLabLoading(false)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '1 hour'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''}`
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  const getStatusIcon = (status: LabHistoryStatus) => {
    switch (status) {
      case 'complete':
        return <CheckCircle sx={{ fontSize: 18, color: '#10b981' }} />
      case 'fail':
        return <Cancel sx={{ fontSize: 18, color: '#ef4444' }} />
      case 'timeout':
        return <Warning sx={{ fontSize: 18, color: '#f59e0b' }} />
      case 'running':
        return <PlayCircle sx={{ fontSize: 18, color: '#3b82f6' }} />
      case 'cancel':
        return <Cancel sx={{ fontSize: 18, color: '#6b7280' }} />
      case 'provisioning':
        return <HourglassEmpty sx={{ fontSize: 18, color: '#8b5cf6' }} />
      case 'pending':
        return <Schedule sx={{ fontSize: 18, color: '#f97316' }} />
      case 'unknown':
      default:
        return <Help sx={{ fontSize: 18, color: '#9ca3af' }} />
    }
  }

  const getStatusColor = (status: LabHistoryStatus): ChipProps['color'] => {
    switch (status) {
      case 'complete':
        return 'success'
      case 'fail':
        return 'error'
      case 'timeout':
        return 'warning'
      case 'running':
        return 'info'
      case 'provisioning':
        return 'info'
      case 'pending':
        return 'warning'
      case 'cancel':
        return 'secondary'
      case 'unknown':
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: LabHistoryStatus) => {
    switch (status) {
      case 'complete':
        return 'Complete'
      case 'fail':
        return 'Failed'
      case 'timeout':
        return 'Timeout'
      case 'running':
        return 'Running'
      case 'cancel':
        return 'Cancelled'
      case 'provisioning':
        return 'Provisioning'
      case 'pending':
        return 'Pending Approval'
      case 'unknown':
      default:
        return 'Unknown'
    }
  }

  if (loading || historyLoading) {
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
          <Box sx={{ mb: 4 }}>
            <Skeleton variant='text' width='70%' height={80} sx={{ borderRadius: 2 }} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '5fr 2fr' },
              gap: 3
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
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
                    <Skeleton variant='circular' width={56} height={56} />
                    <Skeleton variant='text' width={200} height={30} />
                  </Box>
                  <Skeleton variant='rectangular' width={120} height={48} sx={{ borderRadius: 2 }} />
                </Box>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  p: 4,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Skeleton variant='text' width={150} height={40} sx={{ mb: 3 }} />
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} variant='text' width={`${95 - i * 2}%`} height={24} />
                ))}
              </Paper>
            </Box>
            <Box>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  p: 3,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Skeleton variant='text' width={120} height={35} sx={{ mb: 3 }} />
                {[1, 2, 3].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      py: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Skeleton variant='text' width={180} height={24} />
                    <Skeleton variant='rectangular' width={95} height={24} sx={{ borderRadius: 3 }} />
                  </Box>
                ))}
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    )
  }

  if (!labData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant='h6' color='text.secondary'>
          Lab not found
        </Typography>
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
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Container maxWidth='xl'>
        <Box>
          {/* Header */}
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
              {labData.title}
            </Typography>
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '5fr 2fr' },
              gap: 3
            }}
          >
            {/* Left Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  background: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
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
                    <AccessTime sx={{ color: '#ffffff', fontSize: 24 }} />
                  </Box>
                  <Typography variant='body1' sx={{ fontWeight: 700 }}>
                    Duration:{' '}
                    <Box component='span' sx={{ fontWeight: 500 }}>
                      {formatDuration(labData.duration)}
                    </Box>
                  </Typography>
                </Box>

                <Button
                  variant='contained'
                  onClick={handleStartLab}
                  disabled={startLabLoading}
                  sx={{
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                    color: activeSession ? '#fff' : '#000',
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
                    '&.Mui-disabled': {
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                      opacity: 0.7
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  {startLabLoading ? (
                    <CircularProgress size={22} sx={{ color: '#000' }} />
                  ) : activeSession ? (
                    'Resume'
                  ) : (
                    'Start Lab'
                  )}
                </Button>
              </Paper>

              {/* Lab Overview */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  p: 4,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
                  Lab Overview
                </Typography>
                <Typography variant='body1' sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 4 }}>
                  {labData.long_description}
                </Typography>
              </Paper>
            </Box>

            {/* Right Column - Lab History */}
            <Box>
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
                  Lab History
                </Typography>

                {historyLoading ? (
                  <Box>
                    {[1, 2, 3].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Skeleton variant='text' width={180} height={24} />
                        <Skeleton variant='rectangular' width={95} height={24} sx={{ borderRadius: 3 }} />
                      </Box>
                    ))}
                  </Box>
                ) : labHistory.length === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    No history yet. Start your first lab session!
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)'
                    }}
                  >
                    <List sx={{ p: 0 }}>
                      {labHistory.map((item) => (
                        <ListItem
                          key={item.uuid}
                          sx={{
                            px: 0,
                            py: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <CalendarMonth sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant='body2' color='text.secondary'>
                              {item.date}
                            </Typography>
                          </Box>
                          <Chip
                            icon={getStatusIcon(item.status) ?? undefined}
                            label={getStatusLabel(item.status)}
                            size='small'
                            color={getStatusColor(item.status)}
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
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
