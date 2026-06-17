import React from 'react'
import { Alert, Button, CircularProgress, Typography, Box } from '@mui/material'

type OtpProps = {
  email: string
  otp: string[]
  otpRefs: React.MutableRefObject<Array<HTMLInputElement | null>>
  onChange: (index: number, value: string) => void
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void
  error?: string
  loading?: boolean
  onVerify: () => void
  canResend?: boolean
  onResend?: () => void
  resendTimer?: number
  onChangeEmail?: () => void
  primaryBtnSx?: any
  ghostBtnSx?: any
  C?: any
}

export default function Otp({
  email,
  otp,
  otpRefs,
  onChange,
  onKeyDown,
  onPaste,
  error,
  loading,
  onVerify,
  canResend,
  onResend,
  resendTimer,
  onChangeEmail,
  primaryBtnSx,
  ghostBtnSx,
  C
}: OtpProps) {
  const theme = C || {
    inkLight: '#6b7280',
    yellowDark: '#b28704',
    yellowLight: '#fff8e1',
    border: '#e5e7eb',
    white: '#ffffff'
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
      <Typography sx={{ color: theme.inkLight, textAlign: 'center', fontSize: '0.9rem' }}>
        We've sent a 6-digit verification code to
        <br />
        <strong>{email}</strong>
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.2 }}>
        {otp.map((digit, i) => (
          <Box
            key={i}
            component='input'
            ref={(el: HTMLInputElement | null) => {
              otpRefs.current[i] = el
            }}
            value={digit}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(i, e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(i, e)}
            onPaste={onPaste}
            inputMode='numeric'
            autoComplete='one-time-code'
            maxLength={1}
            style={{
              width: 48,
              height: 56,
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 600,
              border: `2px solid ${digit ? theme.yellowDark : theme.border}`,
              borderRadius: 12,
              outline: 'none',
              background: digit ? theme.yellowLight : theme.white,
              transition: 'all 0.15s'
            }}
          />
        ))}
      </Box>

      {error && (
        <Alert severity='error' sx={{ borderRadius: 3, width: '100%' }}>
          {error}
        </Alert>
      )}

      <Button fullWidth variant='contained' onClick={onVerify} disabled={!!loading} sx={primaryBtnSx}>
        {loading ? <CircularProgress size={24} sx={{ color: theme.inkLight }} /> : 'Verify Code'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        {canResend ? (
          <Button
            variant='text'
            onClick={onResend}
            disabled={!!loading}
            sx={{ color: theme.yellowDark, fontSize: '0.85rem', fontWeight: 600 }}
          >
            Resend Code
          </Button>
        ) : (
          <Typography sx={{ color: theme.inkLight, fontSize: '0.85rem' }}>
            Resend code in <strong style={{ color: theme.yellowDark }}>{resendTimer}s</strong>
          </Typography>
        )}
      </Box>

      {onChangeEmail && (
        <Button fullWidth variant='outlined' onClick={onChangeEmail} sx={ghostBtnSx}>
          Change Email
        </Button>
      )}
    </Box>
  )
}
