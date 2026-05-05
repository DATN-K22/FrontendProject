'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Skeleton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material'
import { AccessTime } from '@mui/icons-material'
import { LessonDetail } from '@/utils/dto/Lesson'
import VideoPlayer from '@/components/VideoPlayer'
import api from '@/api/api'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import SafeHtml from '@/components/SafeHtml'

type LeaseData = {
  userEmail: string
  uuid: string
  status: string
  originalLeaseTemplateUuid: string
  originalLeaseTemplateName: string
  comments: string
  createdBy: string
  maxSpend: number
  leaseDurationInHours: number
  budgetThresholds: any[]
  durationThresholds: any[]
  meta: {
    createdTime: string
    lastEditTime: string
    schemaVersion: number
  }
  awsAccountId: string
  approvedBy: string
  startDate: string
  expirationDate: string
  lastCheckedDate: string
  totalCostAccrued: number
  endDate?: string
  ttl: number
  leaseId: string
  consoleUrl?: string
}

type EndMode = 'cancel' | 'complete'
type TerminateStatus = 'ManuallyTerminated' | 'Completed'

const END_MODE_TO_STATUS: Record<EndMode, TerminateStatus> = {
  cancel: 'ManuallyTerminated',
  complete: 'Completed'
}

export default function LabDetail() {
  const { lab_id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const leaseId = searchParams.get('leaseId')
  const [labData, setLabData] = useState<LessonDetail | null>(null)
  const [leaseData, setLeaseData] = useState<LeaseData | null>(null)
  const [loadingLab, setLoadingLab] = useState(true)
  const [loadingLease, setLoadingLease] = useState(true)
  const [loadingConsoleUrl, setLoadingConsoleUrl] = useState(false)
  const [endingLab, setEndingLab] = useState(false)
  const [endConfirmOpen, setEndConfirmOpen] = useState(false)
  const [endMode, setEndMode] = useState<EndMode>('cancel')
  const [endMenuAnchorEl, setEndMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [tabValue, setTabValue] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const terminateInProgressRef = useRef(false)

  useEffect(() => {
    const fetchLabData = async () => {
      try {
        const response = await api.get(`/hands-on-lab/labs/${lab_id}/lab`)
        setLabData(response.data.data)
      } catch (error) {
        setLabData({} as LessonDetail)
        console.error('Error fetching lab data:', error)
      } finally {
        setLoadingLab(false)
      }
    }
    fetchLabData()
  }, [lab_id])

  useEffect(() => {
    const fetchLease = async () => {
      try {
        const res = await api.get(`/labs/leases/${leaseId}`)
        const data: LeaseData = res.data.data
        setLeaseData(data)
        setLoadingLease(false)

        if (data.status === 'Active') {
          const createdTime = new Date(data.meta.createdTime).getTime()
          const durationMs = data.leaseDurationInHours * 60 * 60 * 1000
          const elapsed = Date.now() - createdTime
          const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000))
          setTimeLeft(remaining)

          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
        }
      } catch (error) {
        console.error('Error fetching lease data:', error)
        setLoadingLease(false)
      }
    }

    fetchLease() // immediate first call
    pollingRef.current = setInterval(fetchLease, 3000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [leaseId])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if (countdownRef.current) clearInterval(countdownRef.current)
      return
    }

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [timeLeft > 0 && leaseData?.status === 'Active'])

  const isLeaseActive = leaseData?.status === 'Active'

  const handleEndLab = useCallback(
    async (mode: EndMode) => {
      if (!leaseId || !isLeaseActive || terminateInProgressRef.current) return

      const status = END_MODE_TO_STATUS[mode]

      setEndingLab(true)
      terminateInProgressRef.current = true

      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }

      try {
        await api.post(`/labs/leases/${leaseId}/terminate`, null, {
          params: { status }
        })
      } catch (error) {
        console.error('Error terminating lab:', error)
      } finally {
        setEndingLab(false)
        router.back()
      }
    },
    [isLeaseActive, leaseId, router]
  )

  useEffect(() => {
    if (!isLeaseActive || timeLeft > 0 || !leaseId) return

    void handleEndLab('cancel')
  }, [handleEndLab, isLeaseActive, leaseId, timeLeft])

  const handleOpenEndConfirm = () => {
    setEndConfirmOpen(true)
  }

  const handleOpenEndMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setEndMenuAnchorEl(event.currentTarget)
  }

  const handleCloseEndMenu = () => {
    setEndMenuAnchorEl(null)
  }

  const handleSelectEndMode = (mode: EndMode) => {
    setEndMode(mode)
    handleCloseEndMenu()
    handleOpenEndConfirm()
  }

  const handleCloseEndConfirm = () => {
    if (endingLab) return
    setEndConfirmOpen(false)
  }

  const handleConfirmEndLab = async () => {
    setEndConfirmOpen(false)
    await handleEndLab(endMode)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleGoToConsole = async () => {
    if (!leaseId || !isLeaseActive || loadingConsoleUrl) return

    try {
      setLoadingConsoleUrl(true)
      const res = await api.get(`/labs/leases/${leaseId}/console-url`)
      const consoleUrl = res.data?.data?.consoleUrl as string | undefined

      if (consoleUrl) {
        window.open(consoleUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error('Error fetching console URL:', error)
    } finally {
      setLoadingConsoleUrl(false)
    }
  }

  const handleOpenDiagram = () => {
    console.log('Opening diagram...')
  }

  const handleOpenTerminal = () => {
    console.log('Opening terminal...')
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

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
  }

  const loading = loadingLab

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)'
        }}
      >
        <Container maxWidth='xl' sx={{ py: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton variant='text' width='60%' height={50} />
              <Skeleton variant='text' width='15%' height={30} sx={{ mt: 1 }} />
            </Box>
            <Skeleton variant='rectangular' width={120} height={48} sx={{ borderRadius: '20px' }} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 350px' },
              gap: 3
            }}
          >
            <Box>
              <Skeleton variant='rectangular' width='100%' height={60} sx={{ mb: 2, borderRadius: 2 }} />
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
                <Skeleton variant='rectangular' width='100%' height={400} />
              </Paper>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Skeleton variant='text' width='60%' height={35} sx={{ mb: 2 }} />
                <Skeleton variant='text' width='100%' height={20} sx={{ mb: 3 }} />
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Skeleton variant='text' width='30%' height={20} />
                    <Skeleton variant='rectangular' width='100%' height={45} sx={{ mt: 1, borderRadius: 1 }} />
                  </Box>
                ))}
              </Paper>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Skeleton variant='text' width='40%' height={35} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant='rectangular' width='48%' height={48} sx={{ borderRadius: 2 }} />
                  <Skeleton variant='rectangular' width='48%' height={48} sx={{ borderRadius: 2 }} />
                </Box>
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
          bgcolor: '#f5f7fa',
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
        pb: 8
      }}
    >
      <Container maxWidth='xl'>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2
            }}
          >
            <Box>
              <Typography
                variant='h4'
                component='h1'
                sx={{
                  fontWeight: 'bold',
                  color: 'text.primary',
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2.125rem' }
                }}
              >
                {labData.title}
              </Typography>
            </Box>
          </Box>

          {/* Main Layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '5fr 2fr' },
              gap: 3
            }}
          >
            {/* Main Content Area */}
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
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Duration: <strong>{formatDuration(labData.duration)}</strong>
                    </Typography>
                    {isLeaseActive ? (
                      <Typography
                        variant='body1'
                        sx={{
                          fontWeight: 700,
                          color: timeLeft < 300 ? 'error.main' : 'text.primary',
                          fontFamily: 'monospace',
                          fontSize: '1.25rem'
                        }}
                      >
                        {formatCountdown(timeLeft)}
                      </Typography>
                    ) : (
                      <Skeleton variant='text' width={100} height={30} />
                    )}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexDirection: { xs: 'column', sm: 'row' }
                  }}
                >
                  <Button
                    variant='contained'
                    onClick={handleOpenEndMenu}
                    disabled={!isLeaseActive || endingLab}
                    sx={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                      color: '#000',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: 'none',
                      fontSize: '1rem',
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                      '&.Mui-disabled': {
                        background: '#e0e0e0',
                        color: 'rgba(0,0,0,0.45)'
                      }
                    }}
                  >
                    {endingLab ? 'Ending...' : 'End Lab'}
                  </Button>
                </Box>
              </Paper>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ background: 'white', borderRadius: '20px 20px 0 0' }}>
                  <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    sx={{
                      px: 2,
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: '16px',
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                        color: '#666',
                        '&.Mui-selected': { color: '#ffd700', fontWeight: 600 }
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#ffd700',
                        height: 3
                      }
                    }}
                  >
                    <Tab label='Tutorial Videos' />
                    <Tab label='Project Guide' />
                  </Tabs>
                </Box>

                <Box
                  sx={{
                    display: tabValue === 0 ? 'block' : 'none',
                    background: 'white',
                    borderRadius: '0 0 20px 20px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      aspectRatio: '16/9',
                      background: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {!labData?.resources?.video.length ? (
                      <Skeleton variant='rectangular' width='100%' height='100%' sx={{ borderRadius: 2 }} />
                    ) : (
                      <VideoPlayer url={labData.resources?.video[0].link || ''} />
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: tabValue === 1 ? 'block' : 'none',
                    background: 'white',
                    borderRadius: '0 0 20px 20px',
                    p: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <SafeHtml html={labData.long_description} />
                </Box>
              </Box>
            </Box>

            {/* Sidebar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Lab Credentials */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
                  Lab Credentials
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant={loadingLease ? 'indeterminate' : 'determinate'}
                    value={loadingLease ? undefined : 100}
                    sx={{
                      height: 8,
                      borderRadius: 999,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,
                        bgcolor: loadingLease ? 'primary.main' : 'success.main'
                      }
                    }}
                  />
                  <Typography
                    variant='caption'
                    sx={{
                      mt: 0.75,
                      display: 'block',
                      color: loadingLease ? 'text.secondary' : 'success.main',
                      fontWeight: 600
                    }}
                  >
                    {loadingLease ? 'Đang kiểm tra lease...' : 'Lease đã sẵn sàng'}
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 3, lineHeight: 1.6 }}>
                  It is recommended that all Hands-on Labs are opened in an incognito window.
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant='caption'
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      mb: 0.5,
                      display: 'block'
                    }}
                  >
                    URL
                  </Typography>
                  <Button
                    fullWidth
                    variant='contained'
                    onClick={handleGoToConsole}
                    disabled={loadingLease || !isLeaseActive || loadingConsoleUrl}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                      color: '#000',
                      boxShadow: 'none',
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                      '&.Mui-disabled': {
                        background: '#e0e0e0',
                        color: 'rgba(0,0,0,0.45)'
                      }
                    }}
                  >
                    Go to console
                  </Button>
                </Box>
              </Paper>

              {/* Lab Tools */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
                  Lab Tools
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth
                    variant='outlined'
                    onClick={handleOpenDiagram}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#ffd700',
                      color: '#000',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: '#ffed4e',
                        bgcolor: '#fffef0'
                      }
                    }}
                  >
                    Diagram
                  </Button>
                  <Button
                    fullWidth
                    variant='contained'
                    onClick={handleOpenTerminal}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                      color: '#000',
                      boxShadow: 'none',
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                    }}
                  >
                    Terminal
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>

      <Menu
        anchorEl={endMenuAnchorEl}
        open={Boolean(endMenuAnchorEl)}
        onClose={handleCloseEndMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            border: '1px solid #ffe082',
            background: 'linear-gradient(180deg, #fffdf4 0%, #fff9db 100%)',
            boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
            minWidth: 180,
            '& .MuiMenuItem-root': {
              py: 1,
              fontWeight: 600,
              color: '#4a3b00',
              '&:hover': {
                backgroundColor: 'rgba(255, 215, 0, 0.2)'
              }
            }
          }
        }}
      >
        <MenuItem onClick={() => handleSelectEndMode('cancel')}>Cancel</MenuItem>
        <MenuItem onClick={() => handleSelectEndMode('complete')}>Complete</MenuItem>
      </Menu>

      <Dialog open={endConfirmOpen} onClose={handleCloseEndConfirm} fullWidth maxWidth='xs'>
        <DialogTitle sx={{ fontWeight: 700, color: '#5d4700' }}>Confirm End Lab</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            You selected <strong>{endMode}</strong> mode. Please confirm to end this lab session.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEndConfirm} disabled={endingLab}>
            Back
          </Button>
          <Button
            variant='contained'
            onClick={handleConfirmEndLab}
            disabled={endingLab}
            sx={{
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
              color: '#000',
              fontWeight: 700
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
