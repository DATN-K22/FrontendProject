'use client'

import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  IconButton,
  Grid,
  Slide
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import api from '@/api/api'
import { useRouter } from 'next/navigation'
import { tabButtonSx, yellowTextFieldSx } from '@/utils/styles'
import { authUtils } from '@/utils/auth'

type FormErrors = {
  email?: string
  password?: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Email is not valid'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const res = await api.post('/auth/signin', { email, password })
      const { accessToken, role } = res.data.data

      if (!accessToken) throw new Error('Login failed: no token returned')

      authUtils.setAuth(accessToken, role, rememberMe)
      window.location.href = role === 'admin' ? '/admin' : '/'
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please check your credentials.'
      alert(message)
    }
  }

  return (
    <Slide direction='left' in mountOnEnter unmountOnExit>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          py: { xs: 4, md: 0 },
          px: { xs: 2, sm: 3, md: 6 }
        }}
      >
        <Grid container spacing={{ xs: 2, md: 4 }} alignItems='center' sx={{ width: '100%' }}>
          {/* Left side - Illustration */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                bgcolor: '#FFF59B',
                borderRadius: '2em',
                width: '100%',
                maxWidth: '600px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box
                component='img'
                src='/images/login.png'
                alt='Learning illustration'
                sx={{
                  maxHeight: { md: '40em', lg: '50em' },
                  height: 'auto',
                  width: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Grid>

          {/* Right side - Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                maxWidth: { xs: '100%', sm: '500px', md: '40em' },
                mx: 'auto',
                px: { xs: 2, sm: 3, md: 8 }
              }}
            >
              <Typography
                variant='h5'
                align='center'
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                Welcome to Learnaide..!
              </Typography>

              {/* Tab Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  backgroundColor: '#FFF9C4',
                  borderRadius: { xs: 4, md: 8 },
                  mx: 'auto',
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '400px' },
                  mb: { xs: 2, md: 4 },
                  p: { xs: 0.5, md: 1 }
                }}
              >
                <Button sx={tabButtonSx(true)}>Login</Button>
                <Button onClick={() => router.replace('/auth/register')} sx={tabButtonSx(false)}>
                  Register
                </Button>
              </Box>

              <Typography
                variant='h6'
                color='text.secondary'
                sx={{
                  mb: { xs: 2, md: 4 },
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                  textAlign: 'justify'
                }}
              >
                Learnaide is AI-Powered Online Learning Platform with Personalized Course Paths and Virtual Assistant
              </Typography>

              <form onSubmit={handleSubmit}>
                <Typography
                  variant='subtitle1'
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  placeholder='Enter your Email Address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ mb: { xs: 2, md: 3 }, ...yellowTextFieldSx }}
                />

                <Typography
                  variant='subtitle1'
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your Password'
                  value={password}
                  error={!!errors.password}
                  helperText={errors.password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                          sx={{ p: { xs: 0.5, md: 1 } }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2, ...yellowTextFieldSx }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mb: { xs: 2, md: 3 },
                    gap: { xs: 1, sm: 0 }
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: '#FFD700',
                          '&.Mui-checked': { color: '#FFD700' }
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          fontWeight: 600
                        }}
                      >
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    href='/forgot-password'
                    underline='hover'
                    sx={{
                      color: 'text.primary',
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      fontWeight: 600
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#000',
                    borderRadius: { xs: 4, md: 8 },
                    py: { xs: 1.5, md: 2 },
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    '&:hover': { backgroundColor: '#FFC700' }
                  }}
                >
                  Login
                </Button>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Slide>
  )
}
