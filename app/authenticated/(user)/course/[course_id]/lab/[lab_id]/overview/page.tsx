"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Paper,
  List,
  ListItem,
  Chip,
  CircularProgress,
  SelectChangeEvent,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  AccessTime,
  CheckCircle,
  Cancel,
  Warning,
  ChatBubble,
  CalendarToday,
  VideoLibrary,
} from "@mui/icons-material";
import { LessonDetail } from "@/utils/dto/Lesson";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useRouter } from "next/navigation";
import api from "@/api/api";
import { useAlert } from "@/components/alert";

type LabHistory = {
  date: string;
  mode: "guided" | "challenge";
  status: "timeout" | "complete" | "fail";
};

export default function LabOverview() {
  const { course_id, lab_id } = useParams();
  const [labData, setLabData] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<"guided" | "challenge">(
    "guided",
  );

  const { showAlert } = useAlert();
  const router = useRouter();
  // Mock lab history - trong thực tế sẽ lấy từ API
  const [labHistory] = useState<LabHistory[]>([
    { date: "12/07/2025 at 10:09PM", mode: "guided", status: "timeout" },
    { date: "12/07/2025 at 10:09PM", mode: "guided", status: "complete" },
    { date: "12/07/2025 at 10:09PM", mode: "guided", status: "complete" },
    { date: "12/07/2025 at 10:09PM", mode: "challenge", status: "fail" },
    { date: "12/07/2025 at 10:09PM", mode: "challenge", status: "timeout" },
    { date: "12/07/2025 at 10:09PM", mode: "challenge", status: "complete" },
  ]);

  useEffect(() => {
    // Gọi API để lấy dữ liệu lab
    fetchLabData();
  }, []);

  const fetchLabData = async () => {
    try {
      const lessonResponse = await api.get(`/courses/lessons/${lab_id}`);
      const data: LessonDetail = lessonResponse.data.data;
      setLabData(data);
    } catch (error) {
      console.error("Error fetching lab data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLab = async () => {
    console.log(`Starting lab in ${selectedMode} mode`);
    // Implement lab start logic here
    try {
      await api.patch(`/courses/lessons/${course_id}/${lab_id}/status`);
    } catch (error) {
      showAlert("Failed to start the lab.", "error", {
        vertical: "bottom",
        horizontal: "left",
      });
    }

    router.push(
      `/authenticated/course/${course_id}/lab/${lab_id}/start?mode=${selectedMode}`,
    );
  };

  const handleModeChange = (
    event: SelectChangeEvent<"guided" | "challenge">,
  ) => {
    setSelectedMode(event.target.value as "guided" | "challenge");
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "1 hour";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}${minutes > 0 ? ` ${minutes} min` : ""}`;
    }
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle sx={{ fontSize: 18, color: "#10b981" }} />;
      case "fail":
        return <Cancel sx={{ fontSize: 18, color: "#ef4444" }} />;
      case "timeout":
        return <Warning sx={{ fontSize: 18, color: "#f59e0b" }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "success";
      case "fail":
        return "error";
      case "timeout":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
          pb: 8,
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header Skeleton */}
          <Box sx={{ mb: 4 }}>
            <Skeleton
              variant="text"
              width="70%"
              height={80}
              sx={{ borderRadius: 2 }}
            />
          </Box>

          {/* Main Content Skeleton */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "5fr 2fr" },
              gap: 3,
            }}
          >
            {/* Left Column Skeleton */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Duration and Start Lab Skeleton */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: "white",
                  borderRadius: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "stretch", md: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Skeleton variant="circular" width={56} height={56} />
                    <Skeleton variant="text" width={200} height={30} />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width={180}
                      height={40}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={120}
                      height={48}
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                </Box>
              </Paper>

              {/* Lab Overview Skeleton */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  p: 4,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Skeleton
                  variant="text"
                  width={150}
                  height={40}
                  sx={{ mb: 3 }}
                />
                <Skeleton variant="text" width="100%" height={24} />
                <Skeleton variant="text" width="100%" height={24} />
                <Skeleton variant="text" width="100%" height={24} />
                <Skeleton variant="text" width="95%" height={24} />
                <Skeleton variant="text" width="90%" height={24} />
                <Skeleton variant="text" width="85%" height={24} />
              </Paper>
            </Box>

            {/* Right Column - Lab History Skeleton */}
            <Box>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  p: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Skeleton
                  variant="text"
                  width={120}
                  height={35}
                  sx={{ mb: 3 }}
                />

                {/* Guided Mode Skeleton */}
                <Box
                  sx={{
                    mb: 4,
                    p: 2,
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
                  }}
                >
                  <Skeleton variant="text" width={130} height={30} />
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={20}
                    sx={{ mb: 1, ml: 2 }}
                  />
                  <Box sx={{ pl: 2 }}>
                    {[1, 2, 3].map((item) => (
                      <Box
                        key={item}
                        sx={{
                          py: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Skeleton variant="text" width={180} height={24} />
                        <Skeleton
                          variant="rectangular"
                          width={95}
                          height={24}
                          sx={{ borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Challenge Mode Skeleton */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
                  }}
                >
                  <Skeleton variant="text" width={150} height={30} />
                  <Skeleton
                    variant="text"
                    width="95%"
                    height={20}
                    sx={{ mb: 2, ml: 2 }}
                  />
                  <Box sx={{ pl: 2 }}>
                    {[1, 2, 3].map((item) => (
                      <Box
                        key={item}
                        sx={{
                          py: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Skeleton variant="text" width={180} height={24} />
                        <Skeleton
                          variant="rectangular"
                          width={95}
                          height={24}
                          sx={{ borderRadius: 3 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!labData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Lab not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
        pb: 8,
      }}
    >
      <Box sx={{ pl: 4, pt: 4 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Container maxWidth="xl">
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: "bold",
                color: "text.primary",
                mb: 2,
                fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
              }}
            >
              {labData.title}
            </Typography>
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "5fr 2fr" },
              gap: 3,
            }}
          >
            {/* Left Column - Lab Info */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "stretch", md: "center" },
                  justifyContent: "space-between",
                  gap: 2,

                  background: "white",
                  borderRadius: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: "50%",
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                    }}
                  >
                    <AccessTime sx={{ color: "#ffffff", fontSize: 24 }} />
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    Duration:{" "}
                    <Box component="span" sx={{ fontWeight: 500 }}>
                      {formatDuration(labData.duration)}
                    </Box>
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                      value={selectedMode}
                      onChange={handleModeChange}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 500,
                        color: "#b58900",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderWidth: 2,
                          borderColor: "#ffd700",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ffed4e",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ffd700",
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            "& .MuiMenuItem-root": {
                              color: "#b58900",
                              fontWeight: 500,
                            },
                            "& .MuiMenuItem-root:hover": {
                              bgcolor: "#fff3b0",
                            },
                            "& .Mui-selected": {
                              bgcolor: "#ffe066 !important",
                              color: "#7a5d00",
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="guided">Mode: Guided</MenuItem>
                      <MenuItem value="challenge">Mode: Challenge</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={handleStartLab}
                    sx={{
                      background:
                        "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                      color: "#000",
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "none",
                      fontSize: "1rem",
                      "&:hover": {
                        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    Start Lab
                  </Button>
                </Box>
              </Paper>

              {/* Lab Overview */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  p: 4,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Lab Overview
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary", lineHeight: 1.8, mb: 4 }}
                >
                  {labData.long_description}
                </Typography>
              </Paper>
            </Box>

            {/* Right Column - Lab History */}
            <Box>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  p: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                  position: { lg: "sticky" },
                  top: 24,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Lab History
                </Typography>

                {/* Guided Mode Section */}
                <Box
                  sx={{
                    mb: 4,
                    p: 2,
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Guided Mode
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="justify"
                    sx={{ mb: 1, pl: 2 }}
                  >
                    Practice your new skills with instructional support.
                  </Typography>
                  <List sx={{ p: 0, pl: 2 }}>
                    {labHistory
                      .filter((item) => item.mode === "guided")
                      .map((item, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            px: 0,
                            py: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CalendarToday
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {item.date}
                            </Typography>
                          </Box>
                          <Chip
                            icon={getStatusIcon(item.status) ?? undefined}
                            label={
                              item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)
                            }
                            size="small"
                            color={getStatusColor(item.status) as any}
                            sx={{
                              fontWeight: 500,
                              width: 95,
                              justifyContent: "center",
                              "& .MuiChip-label": {
                                width: "100%",
                                textAlign: "center",
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Box>

                {/* Challenge Mode Section */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Challenge Mode
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="justify"
                    sx={{ mb: 2, pl: 2 }}
                  >
                    Practice your new skills without instruction and receive a
                    score
                  </Typography>
                  <List sx={{ p: 0, pl: 2 }}>
                    {labHistory
                      .filter((item) => item.mode === "challenge")
                      .map((item, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            px: 0,
                            py: 1,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CalendarToday
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {item.date}
                            </Typography>
                          </Box>
                          <Chip
                            icon={getStatusIcon(item.status) ?? undefined}
                            label={
                              item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)
                            }
                            size="small"
                            color={getStatusColor(item.status) as any}
                            sx={{
                              fontWeight: 500,
                              width: 95,
                              justifyContent: "center",
                              "& .MuiChip-label": {
                                width: "100%",
                                textAlign: "center",
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
