// page.tsx
"use client";

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

type RegisterResponse = {
  success: boolean;
  code: number;
  message: string;
  timestamp: string;
  data: any;
};

export type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

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

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email is not valid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await api.post("/auth/signup", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      const { accessToken, role } = res.data.data;

      if (!accessToken) {
        throw new Error("Login failed: no token returned");
      }

      authUtils.setAuth(accessToken, role);

      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Register error:", error);

      const message = error.response?.data?.message || "Register failed!";

      alert(message);
    }
  };

  return (
    <Slide direction="right" in mountOnEnter unmountOnExit>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #ffffffff 0%, #FFFFFF 100%)",
          py: { xs: 4, md: 0 },
          px: { xs: 2, sm: 3, md: 6 },
        }}
      >
        <Grid
          container
          spacing={{ xs: 2, md: 4 }}
          alignItems="center"
          sx={{ width: "100%" }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                maxWidth: { xs: "100%", sm: "500px", md: "40em" },
                mx: "auto",
                px: { xs: 2, sm: 3, md: 8 },
              }}
            >
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  mb: { xs: 1, md: 1.5 },
                  fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                }}
              >
                Welcome to Learnaide..!
              </Typography>

              {/* Tab Buttons */}
              <Box
                sx={{
                  display: "flex",
                  backgroundColor: "#FFF9C4",
                  borderRadius: { xs: 4, md: 8 },
                  mx: "auto",
                  width: "100%",
                  maxWidth: { xs: "100%", sm: "400px" },
                  justifyContent: "center",
                  mb: { xs: 2, md: 4 },
                  p: { xs: 0.5, md: 1 },
                }}
              >
                <Button
                  onClick={() => {
                    router.replace("/auth/login");
                    setActiveTab("login");
                  }}
                  sx={{
                    borderRadius: { xs: 4, md: 8 },
                    backgroundColor:
                      activeTab === "login" ? "#FFD700" : "transparent",
                    color: "#000",
                    textTransform: "none",
                    flex: 1,
                    fontWeight: 600,
                    py: { xs: 1, md: 1.5 },
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    "&:hover": {
                      backgroundColor:
                        activeTab === "login"
                          ? "#FFD700"
                          : "rgba(255, 215, 0, 0.1)",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("register");
                  }}
                  sx={{
                    borderRadius: { xs: 4, md: 8 },
                    flex: 1,
                    backgroundColor:
                      activeTab === "register" ? "#FFD700" : "transparent",
                    color: "#000",
                    textTransform: "none",
                    fontWeight: 600,
                    py: { xs: 1, md: 1.5 },
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    "&:hover": {
                      backgroundColor:
                        activeTab === "register"
                          ? "#FFD700"
                          : "rgba(255, 215, 0, 0.1)",
                    },
                  }}
                >
                  Register
                </Button>
              </Box>

              {/* <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: { xs: 2, md: 4 },
                  fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
                  textAlign: { xs: "justify", md: "justify" },
                }}
              >
                Learnaide is AI-Powered Online Learning Platform with
                Personalized Course Paths and Virtual Assistant
              </Typography> */}

              <form onSubmit={handleSubmit}>
                <Grid
                  container
                  spacing={{ xs: 2, md: 4 }}
                  alignItems="stretch"
                  sx={{ width: "100%" }}
                >
                  <Grid size={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontSize: { xs: "0.875rem", md: "1rem" },
                      }}
                    >
                      First Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter your First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      sx={{
                        mb: { xs: 1, md: 1.5 },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: { xs: 4, md: 8 },
                          fontSize: { xs: "0.875rem", md: "1rem" },
                          "& fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": {
                            borderColor: "#FFD700",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                          },
                          "& .MuiOutlinedInput-input": {
                            py: { xs: 1.5, md: 2 },
                            px: { xs: 2, md: 3 },
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid size={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        fontSize: { xs: "0.875rem", md: "1rem" },
                      }}
                    >
                      Last Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter your Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      sx={{
                        mb: { xs: 1, md: 1.5 },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: { xs: 4, md: 8 },
                          fontSize: { xs: "0.875rem", md: "1rem" },
                          "& fieldset": {
                            borderColor: "#FFD700",
                            borderWidth: 2,
                          },
                          "&:hover fieldset": {
                            borderColor: "#FFD700",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FFD700",
                          },
                          "& .MuiOutlinedInput-input": {
                            py: { xs: 1.5, md: 2 },
                            px: { xs: 2, md: 3 },
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your Email Address"
                  value={email}
                  error={!!errors.email}
                  helperText={errors.email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    mb: { xs: 1, md: 1.5 },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: { xs: 4, md: 8 },
                      fontSize: { xs: "0.875rem", md: "1rem" },
                      "& fieldset": {
                        borderColor: "#FFD700",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderColor: "#FFD700",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FFD700",
                      },
                      "& .MuiOutlinedInput-input": {
                        py: { xs: 1.5, md: 2 },
                        px: { xs: 2, md: 3 },
                      },
                    },
                  }}
                />

                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  }}
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your Password"
                  value={password}
                  error={!!errors.password}
                  helperText={errors.password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            p: { xs: 0.5, md: 1 },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: { xs: 4, md: 8 },
                      fontSize: { xs: "0.875rem", md: "1rem" },
                      "& fieldset": {
                        borderColor: "#FFD700",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderColor: "#FFD700",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FFD700",
                      },
                      "& .MuiOutlinedInput-input": {
                        py: { xs: 1.5, md: 2 },
                        px: { xs: 2, md: 3 },
                      },
                    },
                  }}
                />

                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  }}
                >
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Enter your Password again"
                  value={confirmPassword}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          sx={{
                            p: { xs: 0.5, md: 1 },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: { xs: 4, md: 8 },
                      fontSize: { xs: "0.875rem", md: "1rem" },
                      "& fieldset": {
                        borderColor: "#FFD700",
                        borderWidth: 2,
                      },
                      "&:hover fieldset": {
                        borderColor: "#FFD700",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FFD700",
                      },
                      "& .MuiOutlinedInput-input": {
                        py: { xs: 1.5, md: 2 },
                        px: { xs: 2, md: 3 },
                      },
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    mb: { xs: 1, md: 1.5 },
                    gap: { xs: 1, sm: 0 },
                  }}
                >
                  <Link
                    href="/forgot-password"
                    underline="hover"
                    sx={{
                      color: "text.primary",
                      fontSize: { xs: "0.875rem", md: "1rem" },
                      fontWeight: 600,
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "#FFD700",
                    color: "#000",
                    borderRadius: { xs: 4, md: 8 },
                    py: { xs: 1.5, md: 2 },
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    "&:hover": {
                      backgroundColor: "#FFC700",
                    },
                  }}
                >
                  Register
                </Button>
              </form>
            </Box>
          </Grid>

          {/* Right side - Form */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "#FFF59B",
                borderRadius: "2em",
                width: "100%",
                maxWidth: "600px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src="/images/register.png"
                alt="Learning illustration"
                sx={{
                  maxHeight: { md: "40em", lg: "50em" },
                  height: "auto",
                  width: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Slide>
  );
}
