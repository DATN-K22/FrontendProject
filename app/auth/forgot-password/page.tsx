'use client'

import api from '@/api/api'
import { EyeIcon } from '@/app/authenticated/(user)/[user_id]/profile/page'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import MailIcon from '@mui/icons-material/Mail'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { authUtils } from '@/utils/auth'
import Otp from '@/components/Otp'

// ─── Theme colors ──────────────────────────────────────────────────────────────
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

// ─── Shared input styles ───────────────────────────────────────────────────────
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: { xs: 4, md: 8 },
    fontSize: { xs: '0.875rem', md: '1rem' },
    '& fieldset': {
      borderColor: C.yellowDark,
      borderWidth: 2
    },
    '&:hover fieldset': {
      borderColor: C.yellowDark
    },
    '&.Mui-focused fieldset': {
      borderColor: C.yellowDark,
      borderWidth: 2
    },
    '& .MuiOutlinedInput-input': {
      py: { xs: 1.5, md: 2 },
      px: { xs: 2, md: 3 }
    }
  }
}

const primaryBtn = {
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
}

const ghostBtn = {
  border: `2px solid ${C.yellowDark}`,
  color: C.ink,
  fontWeight: 600,
  borderRadius: '50px',
  px: 4,
  py: 1.5,
  fontSize: '1rem',
  '&:hover': { background: C.yellowLight }
}

// ─── Main Component ────────────────────────────────────────────────────────────
type Step = 'email' | 'otp' | 'password' | 'success'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for resend OTP
  useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [step, resendTimer])

  // Step 1: Submit email
  const handleSubmitEmail = async () => {
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/users/auth/otp', { email })
      setStep('otp')
      setResendTimer(60)
      setCanResend(false)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Email not found. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter the full 6-digit OTP.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post(`/users/auth/otp-verifications?type=forgot_password`, {
        email,
        otp: code
      })
      setStep('password')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/users/auth/reset-password', {
        email,
        otp: otp.join(''),
        newPassword: newPassword
      })
      authUtils.clearAuth()
      setStep('success')
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return

    setLoading(true)
    setError('')
    try {
      await api.post('/users/auth/otp', { email })
      setResendTimer(60)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setLoading(false)
    }
  }

  // OTP input handlers
  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()

    const pasteData = e.clipboardData.getData('text').trim()

    if (!/^\d+$/.test(pasteData)) return

    const digits = pasteData.slice(0, 6).split('')

    const newOtp = [...otp]

    digits.forEach((d, i) => {
      newOtp[i] = d
    })

    setOtp(newOtp)

    const lastIndex = Math.min(digits.length - 1, otpRefs.current.length - 1)
    otpRefs.current[lastIndex]?.focus()
  }

  // Stepper configuration
  const steps = ['Enter Email', 'Verify OTP', 'New Password']
  const activeStep = step === 'email' ? 0 : step === 'otp' ? 1 : step === 'password' ? 2 : 3

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
      {/* ─── Main Card ─── */}
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
        {/* ─── Header ─── */}
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
            Forgot Password?
          </Typography>
          <Typography
            sx={{
              color: C.inkLight,
              fontSize: '0.9rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            Don't worry, we'll help you reset it
          </Typography>
        </Box>

        {/* ─── Stepper (hide on success) ─── */}
        {step !== 'success' && (
          <Box sx={{ px: 4, pt: 4, pb: 2 }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-active': { color: C.yellow },
                        '&.Mui-completed': { color: C.yellowDark }
                      }
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem' }}>{label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {/* ─── Content ─── */}
        <Box sx={{ p: 4 }}>
          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: EMAIL
          ══════════════════════════════════════════════════════════════════ */}
          {step === 'email' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography sx={{ color: C.inkLight, fontSize: '0.9rem' }}>
                Enter your email address and we'll send you a verification code to reset your password.
              </Typography>

              <Box>
                <Typography
                  variant='subtitle1'
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  User name or Email Address
                </Typography>
                <TextField
                  fullWidth
                  placeholder='Enter your User name or Email Address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!error}
                  helperText={error}
                  sx={{
                    mb: { xs: 2, md: 3 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: { xs: 4, md: 8 },
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      '& fieldset': {
                        borderColor: '#FFD700',
                        borderWidth: 2
                      },
                      '&:hover fieldset': {
                        borderColor: '#FFD700'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFD700'
                      },
                      '& .MuiOutlinedInput-input': {
                        py: { xs: 1.5, md: 2 },
                        px: { xs: 2, md: 3 }
                      }
                    }
                  }}
                />
              </Box>

              <Button fullWidth variant='contained' onClick={handleSubmitEmail} disabled={loading} sx={primaryBtn}>
                {loading ? <CircularProgress size={24} sx={{ color: C.ink }} /> : 'Send Verification Code'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant='text'
                  onClick={() => router.push('/auth/login')}
                  sx={{
                    color: C.inkLight,
                    fontSize: '0.85rem',
                    textDecoration: 'underline'
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2: OTP
          ══════════════════════════════════════════════════════════════════ */}
          {step === 'otp' && (
            <Otp
              email={email}
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
              onChangeEmail={() => {
                setStep('email')
                setError('')
                setOtp(['', '', '', '', '', ''])
              }}
              primaryBtnSx={primaryBtn}
              ghostBtnSx={ghostBtn}
              C={C}
            />
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3: NEW PASSWORD
          ══════════════════════════════════════════════════════════════════ */}
          {step === 'password' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography sx={{ color: C.inkLight, fontSize: '0.9rem' }}>
                Enter your new password. Make sure it's at least 8 characters long.
              </Typography>

              <Box>
                <Typography
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  New Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder='Enter your new password'
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={inputSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowPassword(!showPassword)} size='small'>
                          <EyeIcon off={!showPassword} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  Confirm New Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder='Confirm your new password'
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                  sx={inputSx}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowConfirm(!showConfirm)} size='small'>
                          <EyeIcon off={!showConfirm} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {error && (
                <Alert severity='error' sx={{ borderRadius: 3 }}>
                  {error}
                </Alert>
              )}

              <Button fullWidth variant='contained' onClick={handleResetPassword} disabled={loading} sx={primaryBtn}>
                {loading ? <CircularProgress size={24} sx={{ color: C.ink }} /> : 'Reset Password'}
              </Button>
            </Box>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 4: SUCCESS
          ══════════════════════════════════════════════════════════════════ */}
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

              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  textAlign: 'center'
                }}
              >
                Password Reset Successful!
              </Typography>

              <Typography
                sx={{
                  color: C.inkLight,
                  textAlign: 'center',
                  fontSize: '0.95rem'
                }}
              >
                Your password has been reset successfully. You can now log in with your new password.
              </Typography>

              <Button
                fullWidth
                variant='contained'
                onClick={() => {
                  router.push('/auth/login')
                }}
                sx={primaryBtn}
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
