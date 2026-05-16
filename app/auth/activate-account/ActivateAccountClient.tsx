'use client'

import api from '@/api/api'
import Otp from '@/components/Otp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MailIcon from '@mui/icons-material/Mail'
import { Box, Button, Typography } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const C = {
  yellow: '#FFCC00',
  yellowLight: '#FFF9CC',
  yellowDark: '#FFCC00',
  cream: '#FAFAF5',
  white: '#FFFFFF',
  ink: '#1A1A1A',
  inkLight: '#555555',
  border: '#E8E4D4',
  success: '#4CAF50'
}

type Step = 'otp' | 'success'

export default function ActivateAccountClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('otp')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const queryEmail = searchParams.get('email') ?? ''
    const email = decodeURIComponent(queryEmail)
    setEmail(email)
    if (!queryEmail) {
      setError('Missing email address. Please return to register and try again.')
    }
  }, [searchParams])

  useEffect(() => {
    if (step !== 'otp') return

    if (resendTimer <= 0) {
      setCanResend(true)
      return
    }

    const timer = setTimeout(() => setResendTimer((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [step, resendTimer])

  const resetOtp = () => {
    setOtp(['', '', '', '', '', ''])
    otpRefs.current[0]?.focus()
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (!email) {
      setError('Missing email address. Please return to register and try again.')
      return
    }
    if (code.length < 6) {
      setError('Please enter the full 6-digit OTP.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/users/auth/otp-verifications', {
        email,
        otp: code
      })
      setStep('success')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend || !email) return

    setLoading(true)
    setError('')
    try {
      await api.post('/users/auth/otp', { email })
      setResendTimer(60)
      setCanResend(false)
      resetOtp()
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKey = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').trim()
    if (!/^\d+$/.test(pasteData)) return

    const digits = pasteData.slice(0, 6).split('')
    const next = [...otp]
    digits.forEach((digit, index) => {
      next[index] = digit
    })
    setOtp(next)
    const lastIndex = Math.min(digits.length - 1, otpRefs.current.length - 1)
    otpRefs.current[lastIndex]?.focus()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: C.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2
      }}
    >
      <Box
        sx={{
          maxWidth: 520,
          width: '100%',
          background: C.white,
          borderRadius: 5,
          border: `1.5px solid ${C.border}`,
          boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${C.yellow} 0%, ${C.yellowDark} 100%)`,
            p: 4,
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: C.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              position: 'relative',
              zIndex: 1
            }}
          >
            <MailIcon />
          </Box>
          <Typography
            variant='h5'
            sx={{
              fontWeight: 700,
              mb: 0.5,
              position: 'relative',
              zIndex: 1
            }}
          >
            Activate Account
          </Typography>
          <Typography
            sx={{
              color: C.inkLight,
              fontSize: '0.9rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            Enter the 6-digit verification code to activate your account.
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          {step === 'otp' && (
            <Otp
              email={email || 'your email'}
              otp={otp}
              otpRefs={otpRefs}
              onChange={handleOtpChange}
              onKeyDown={handleOtpKey}
              onPaste={handleOtpPaste}
              error={error}
              loading={loading}
              onVerify={handleVerifyOtp}
              canResend={canResend}
              onResend={handleResendOtp}
              resendTimer={resendTimer}
              primaryBtnSx={{
                backgroundColor: '#FFD700',
                color: '#000',
                borderRadius: { xs: 4, md: 8 },
                py: { xs: 1.5, md: 2 },
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', md: '1rem' },
                '&:hover': {
                  backgroundColor: '#FFC700'
                }
              }}
            />
          )}

          {step === 'success' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                py: 3
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: C.yellowLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `3px solid ${C.yellowDark}`,
                  color: C.success
                }}
              >
                <CheckCircleIcon />
              </Box>

              <Typography variant='h5' sx={{ fontWeight: 700, textAlign: 'center' }}>
                Account Activated!
              </Typography>

              <Typography sx={{ color: C.inkLight, textAlign: 'center', fontSize: '0.95rem' }}>
                Your account has been activated successfully. You can now log in.
              </Typography>

              <Button
                fullWidth
                variant='contained'
                onClick={() => router.push('/auth/login')}
                sx={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  borderRadius: { xs: 4, md: 8 },
                  py: { xs: 1.5, md: 2 },
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  '&:hover': {
                    backgroundColor: '#FFC700'
                  }
                }}
              >
                Go to Login
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
