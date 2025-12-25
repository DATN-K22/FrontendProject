// page.tsx
"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  IconButton,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "@/api/api";
import { authUtils } from "@/utils/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      const { accessToken, role, user } = res.data;

      if (!accessToken) {
        throw new Error("Login failed: no token returned");
      }

      authUtils.setAuth(accessToken, role, user);

      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Login error:", error);

      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";

      alert(message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #ffffffff 0%, #FFFFFF 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left side - Illustration */}
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              display: { xs: "none", md: "flex" },
            }}
          >
            <Box
              sx={{
                backgroundColor: "#FFF9C4",
                borderRadius: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src="/images/login.png"
                alt="Learning illustration"
                sx={{
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ maxWidth: 500, mx: "auto" }}>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{ fontWeight: 600, mb: 3 }}
              >
                Welcome to Learnaide..!
              </Typography>

              {/* Tab Buttons */}
              <Box
                sx={{
                  display: "flex",
                  backgroundColor: "#FFF9C4",
                  borderRadius: 8,
                  p: 0.5,
                  width: "fit-content",
                  mx: "auto",
                  justifyContent: "center",
                  mb: 4,
                }}
              >
                <Button
                  onClick={() => setActiveTab("login")}
                  sx={{
                    borderRadius: 8,
                    backgroundColor:
                      activeTab === "login" ? "#FFD700" : "transparent",
                    color: "#000",
                    textTransform: "none",
                    width: 200,
                    fontWeight: 600,
                    py: 1.5,
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
                  onClick={() => setActiveTab("register")}
                  sx={{
                    borderRadius: 8,
                    width: 200,
                    backgroundColor:
                      activeTab === "register" ? "#FFD700" : "transparent",
                    color: "#000",
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
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

              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Learnaide is AI-Powered Online Learning Platform with
                Personalized Course Paths and Virtual Assistant
              </Typography>

              <form onSubmit={handleSubmit}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  User name or Email Address
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your User name or Email Address"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 8,
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
                    },
                  }}
                />

                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 8,
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
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: "#FFD700",
                          "&.Mui-checked": {
                            color: "#FFD700",
                          },
                        }}
                      />
                    }
                    label="Remember me"
                  />
                  <Link
                    href="#"
                    underline="hover"
                    sx={{ color: "text.primary", fontSize: "0.875rem" }}
                  >
                    Forgot Password ?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "#FFD700",
                    color: "#000",
                    borderRadius: 8,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "#FFC700",
                    },
                  }}
                >
                  Login
                </Button>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
