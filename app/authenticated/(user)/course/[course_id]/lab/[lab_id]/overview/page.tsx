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
  ListItemText,
  Chip,
  CircularProgress,
  Fab,
  SelectChangeEvent,
  Skeleton,
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

type LabHistory = {
  date: string;
  mode: "guided" | "challenge";
  status: "timeout" | "complete" | "fail";
};

export default function LabOverview() {
  const [labData, setLabData] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<"guided" | "challenge">(
    "guided",
  );

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
      // Thay thế URL này bằng endpoint API thực tế của bạn
      const response = await fetch("/api/lessons/your-lesson-id");
      const data: LessonDetail = await response.json();
      setLabData(data);
    } catch (error) {
      console.error("Error fetching lab data:", error);
      // Mock data để demo
      setLabData({
        id: "1",
        title: "Launch an EC2 Instance in a Virtual Private Cloud (VPC)",
        status: "active",
        type: "lab",
        short_description: "Learn to launch EC2 instances in VPC",
        long_description:
          "In this hands-on lab, you'll launch an Amazon EC2 instance within a custom Virtual Private Cloud (VPC). You'll design and configure a basic VPC architecture that includes a public subnet, an internet gateway, and route tables to manage network traffic. Finally, you'll launch an EC2 instance into the public subnet and configure its security group to allow external access. By completing this lab, you will strengthen your understanding of core AWS networking concepts and gain practical experience deploying compute resources securely within a VPC.",
        sort_order: 1,
        duration: 3600, // 1 hour in seconds
        isFinished: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartLab = () => {
    console.log(`Starting lab in ${selectedMode} mode`);
    // Implement lab start logic here
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
          background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={60} />
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
            gridTemplateColumns: { xs: "1fr", lg: "3fr 1fr" },
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
                      bgcolor: "white",
                      borderRadius: 2,
                      fontWeight: 500,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: 2,
                        borderColor: "#ffd700",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#ffed4e",
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
                      "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    color: "#000",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    boxShadow: 3,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      boxShadow: 4,
                      transform: "scale(1.02)",
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
                borderRadius: 3,
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

              {/* What to Expect */}
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                What to Expect
              </Typography>
              <List sx={{ p: 0 }}>
                {[
                  {
                    title: "Environment:",
                    text: "You will work directly in the AWS Management Console to complete the objectives in your lab.",
                  },
                  {
                    title: "Access:",
                    text: "We will provide you with secure, temporary credentials to a cloud account to log in and use during your lab.",
                  },
                  {
                    title: "Modes:",
                    text: "This lab is available to take in Guided Mode with step-by-step instructions + validation of your work and Challenge Mode to test your skills for a score.",
                  },
                  {
                    title: "Progress:",
                    text: "Your progress is not saved if you quit the lab or the lab times out.",
                  },
                ].map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0, alignItems: "flex-start", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "grey.900",
                        mt: 1,
                        flexShrink: 0,
                      }}
                    />
                    <ListItemText
                      primary={
                        <Typography component="span" variant="body1">
                          <Box component="span" sx={{ fontWeight: 700 }}>
                            {item.title}
                          </Box>{" "}
                          {item.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>

          {/* Right Column - Lab History */}
          <Box>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
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
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#3b82f6",
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Guided Mode
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, pl: 2 }}
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
                          borderBottom:
                            index <
                            labHistory.filter((i) => i.mode === "guided")
                              .length -
                              1
                              ? "1px solid"
                              : "none",
                          borderColor: "grey.200",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarToday
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {item.date}
                          </Typography>
                        </Box>
                        {/* <Chip
                          icon={getStatusIcon(item.status)}
                          label={
                            item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)
                          }
                          size="small"
                          color={getStatusColor(item.status) as any}
                          sx={{ fontWeight: 500 }}
                        /> */}
                      </ListItem>
                    ))}
                </List>
              </Box>

              {/* Challenge Mode Section */}
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#a855f7",
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Challenge Mode
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
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
                          borderBottom:
                            index <
                            labHistory.filter((i) => i.mode === "challenge")
                              .length -
                              1
                              ? "1px solid"
                              : "none",
                          borderColor: "grey.200",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CalendarToday
                            sx={{ fontSize: 14, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {item.date}
                          </Typography>
                        </Box>
                        {/* <Chip
                          icon={getStatusIcon(item.status)}
                          label={
                            item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)
                          }
                          size="small"
                          color={getStatusColor(item.status) as any}
                          sx={{ fontWeight: 500 }}
                        /> */}
                      </ListItem>
                    ))}
                </List>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
