"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  TextField,
  IconButton,
  Skeleton,
} from "@mui/material";
import { ContentCopy, AccessTime } from "@mui/icons-material";
import { LessonDetail } from "@/utils/dto/Lesson";
import VideoPlayer from "@/components/VideoPlayer";
import api from "@/api/api";
import { useParams } from "next/navigation";
import SafeHtml from "@/components/SafeHtml";

type LabCredentials = {
  url: string;
};

type TabValue = "videos" | "guide";

export default function LabDetail() {
  const { lab_id } = useParams();
  const [labData, setLabData] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [credentials, setCredentials] = useState<LabCredentials>({
    url: "https://021896780529.signin",
  });

  useEffect(() => {
    fetchLabData();
  }, []);

  const fetchLabData = async () => {
    try {
      const response = await api.get(`/hands-on-lab/labs/${lab_id}/lab`);
      const res = await api.get(`/hands-on-lab/labs/start/${lab_id}`);

      setLabData(response.data.data);
      setCredentials({ url: res.data.data.console_url });
    } catch (error) {
      console.error("Error fetching lab data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const handleEndLab = () => {
    console.log("Ending lab...");
    // Implement end lab logic
  };

  const handleOpenDiagram = () => {
    console.log("Opening diagram...");
    // Implement diagram logic
  };

  const handleOpenTerminal = () => {
    console.log("Opening terminal...");
    // Implement terminal logic
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Header Skeleton */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={50} />
              <Skeleton variant="text" width="15%" height={30} sx={{ mt: 1 }} />
            </Box>
            <Skeleton
              variant="rectangular"
              width={120}
              height={48}
              sx={{
                borderRadius: "20px",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 350px" },
              gap: 3,
            }}
          >
            {/* Main Content Skeleton */}
            <Box>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={60}
                sx={{ mb: 2, borderRadius: 2 }}
              />
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
                <Skeleton variant="rectangular" width="100%" height={400} />
              </Paper>
            </Box>

            {/* Sidebar Skeleton */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={35}
                  sx={{ mb: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="100%"
                  height={20}
                  sx={{ mb: 3 }}
                />
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Skeleton variant="text" width="30%" height={20} />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={45}
                      sx={{ mt: 1, borderRadius: 1 }}
                    />
                  </Box>
                ))}
              </Paper>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Skeleton
                  variant="text"
                  width="40%"
                  height={35}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Skeleton
                    variant="rectangular"
                    width="48%"
                    height={48}
                    sx={{ borderRadius: 2 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width="48%"
                    height={48}
                    sx={{ borderRadius: 2 }}
                  />
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
          bgcolor: "#f5f7fa",
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
      <Container maxWidth="xl">
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  color: "text.primary",
                  mb: 1,
                  fontSize: { xs: "1.75rem", md: "2.125rem" },
                }}
              >
                {labData.title}
              </Typography>
            </Box>
          </Box>

          {/* Main Layout */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "5fr 2fr" },
              gap: 3,
            }}
          >
            {/* Main Content Area */}
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
                  <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    Duration:{" "}
                    <strong>{formatDuration(labData.duration)}</strong>
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
                  <Button
                    variant="contained"
                    onClick={handleEndLab}
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
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    End Lab
                  </Button>
                </Box>
              </Paper>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{ background: "white", borderRadius: "20px 20px 0 0" }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    sx={{
                      px: 2,
                      "& .MuiTab-root": {
                        textTransform: "none",
                        fontSize: "16px",
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                        color: "#666",
                        "&.Mui-selected": {
                          color: "#ffd700",
                          fontWeight: 600,
                        },
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#ffd700",
                        height: 3,
                      },
                    }}
                  >
                    <Tab label="Tutorial Videos" />
                    <Tab label="Project Guide" />
                  </Tabs>
                </Box>

                {/* Tab Panel: Tutorial Videos */}
                <Box
                  sx={{
                    display: tabValue === 0 ? "block" : "none",
                    background: "white",
                    borderRadius: "0 0 20px 20px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      aspectRatio: "16/9",
                      background: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {loading || !labData?.resources?.video.length ? (
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                        sx={{ borderRadius: 2 }}
                      />
                    ) : (
                      <VideoPlayer
                        url={labData.resources?.video[0].link || ""}
                      />
                    )}
                  </Box>
                </Box>

                {/* Tab Panel: Description */}
                <Box
                  sx={{
                    display: tabValue === 1 ? "block" : "none",
                    background: "white",
                    borderRadius: "0 0 20px 20px",
                    p: 3,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  {loading || !labData ? (
                    <>
                      <Skeleton width="60%" height={28} sx={{ mb: 1 }} />
                      <Skeleton width="100%" height={20} />
                      <Skeleton width="90%" height={20} />
                      <Skeleton width="80%" height={20} />
                    </>
                  ) : (
                    <>
                      <SafeHtml html={labData.long_description} />
                    </>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Sidebar */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Lab Credentials */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,

                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Lab Credentials
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, lineHeight: 1.6 }}
                >
                  It is recommended that all Hands-on Labs are opened in an
                  incognito window.
                </Typography>

                {/* URL */}
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      mb: 0.5,
                      display: "block",
                    }}
                  >
                    URL
                  </Typography>
                  <TextField
                    fullWidth
                    value={credentials.url}
                    size="small"
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(credentials.url)}
                          sx={{ color: "text.secondary" }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      ),
                      sx: {
                        bgcolor: "#f8f9fa",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#dee2e6",
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>

              {/* Lab Tools */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,

                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Lab Tools
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleOpenDiagram}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#ffd700",
                      color: "#000",
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                        borderColor: "#ffed4e",
                        bgcolor: "#fffef0",
                      },
                    }}
                  >
                    Diagram
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleOpenTerminal}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      background:
                        "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                      color: "#000",
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      },
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
    </Box>
  );
}
