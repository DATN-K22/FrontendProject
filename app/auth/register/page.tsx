'use client'

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Grid,
  Slide,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "@/api/api";
import { authUtils } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/loading";
import { useAlert } from "@/components/alert";

type FormErrors = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const { showLoading, hideLoading } = useLoading();
  const { showAlert } = useAlert();

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!firstName.trim()) newErrors.firstName = 'First name is required'
    if (!lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Email is not valid'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 5) {
      newErrors.password = 'Password must be at least 5 characters'
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required'
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      showLoading();
      const res = await api.post("/users/auth/signup", {
        email,
        password,
        first_name: firstName,
        last_name: lastName
      })
      const { accessToken, role } = res.data.data
      if (!accessToken) throw new Error('Register failed: no token returned')

      const { tokens, user } = res.data.data;

      if (!tokens.accessToken) {
        throw new Error("Login failed: no token returned");
      }

      authUtils.setAuth(tokens, user);

      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        router.replace("/authenticated/hompage");
      }
    } catch (error: any) {
      console.error("Register error:", error);

      const message = error.response?.data?.message || "Register failed!";

      showAlert(message, "error", { vertical: "bottom", horizontal: "left" });
    } finally {
      hideLoading();
    }
  }

  return (
    <Slide direction='right' in mountOnEnter unmountOnExit>
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
          {/* Left side - Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ maxWidth: { xs: '100%', sm: '500px', md: '40em' }, mx: 'auto', px: { xs: 2, sm: 3, md: 8 } }}>
              <Typography
                variant='h5'
                align='center'
                gutterBottom
                sx={{ fontWeight: 600, mb: { xs: 1, md: 1.5 }, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
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
                <Button onClick={() => router.replace('/auth/login')} sx={tabButtonSx(false)}>
                  Login
                </Button>
                <Button sx={tabButtonSx(true)}>Register</Button>
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={{ xs: 2, md: 4 }} sx={{ width: '100%' }}>
                  <Grid size={6}>
                    <Typography
                      variant='subtitle1'
                      sx={{ mb: 1, fontWeight: 600, fontSize: { xs: '0.875rem', md: '1rem' } }}
                    >
                      First Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder='Enter your First Name'
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      sx={{ mb: { xs: 1, md: 1.5 }, ...yellowTextFieldSx }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Typography
                      variant='subtitle1'
                      sx={{ mb: 1, fontWeight: 600, fontSize: { xs: '0.875rem', md: '1rem' } }}
                    >
                      Last Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder='Enter your Last Name'
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      sx={{ mb: { xs: 1, md: 1.5 }, ...yellowTextFieldSx }}
                    />
                  </Grid>
                </Grid>

                <Typography
                  variant='subtitle1'
                  sx={{ mb: 1, fontWeight: 600, fontSize: { xs: '0.875rem', md: '1rem' } }}
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
                  sx={{ mb: { xs: 1, md: 1.5 }, ...yellowTextFieldSx }}
                />

                <Typography
                  variant='subtitle1'
                  sx={{ mb: 1, fontWeight: 600, fontSize: { xs: '0.875rem', md: '1rem' } }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
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

                <Typography
                  variant='subtitle1'
                  sx={{ mb: 1, fontWeight: 600, fontSize: { xs: '0.875rem', md: '1rem' } }}
                >
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='Enter your Password again'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge='end'
                          sx={{ p: { xs: 0.5, md: 1 } }}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2, ...yellowTextFieldSx }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: { xs: 1, md: 1.5 } }}>
                  <Link
                    href='/forgot-password'
                    underline='hover'
                    sx={{ color: 'text.primary', fontSize: { xs: '0.875rem', md: '1rem' }, fontWeight: 600 }}
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
                  Register
                </Button>
              </form>
            </Box>
          </Grid>

          {/* Right side - Illustration */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
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
                src='/images/register.png'
                alt='Register illustration'
                sx={{ maxHeight: { md: '40em', lg: '50em' }, height: 'auto', width: '100%', objectFit: 'contain' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Slide>
  )
}
