"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  Chip,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  AccessTime,
  CheckCircle,
  Cancel,
  Warning,
  CalendarToday,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useRouter } from "next/navigation";
import api from "@/api/api";
import { useAlert } from "@/components/alert";
import { authUtils } from "@/utils/auth";

type Quiz = {
  id: string;
  title: string;
  time_limit: number;
  description: string | null;
  chapter_id: string;
  finish: boolean;
};

type QuizHistory = {
  id: string;
  quiz_id: string;
  user_id: string;
  started_at: string | Date;
  ended_at: string | Date | null;
  finish: boolean;
  rightQuestions: number;
  questionOrder: Array<string | number>;
};

type QuizOverviewData = {
  quiz: Quiz;
  history: QuizHistory[];
};

type QuizOverviewApiResponse = {
  data: QuizOverviewData;
};

// Mock data for testing UI
const MOCK_QUIZ_DATA: Quiz = {
  id: "1",
  title: "JavaScript Fundamentals Quiz",
  time_limit: 90,
  description: `This quiz covers essential JavaScript concepts including variables, data types, operators, control flow, and functions. 

You will have 30 minutes to complete 25 questions. The quiz tests your understanding of:
• Variable declarations and scoping
• Data types and type coercion
• Operators and expressions
• Conditional statements
• Loops and iterations
• Functions and arrow functions

Make sure to read each question carefully and select the most appropriate answer. There is no penalty for incorrect answers.`,
  chapter_id: "29",
  finish: false,
};

const USE_MOCK_DATA = true; // Set to false to use real API

const MOCK_QUIZ_HISTORY: QuizHistory[] = [
  {
    id: "session-1",
    quiz_id: "1",
    user_id: "user-1",
    started_at: new Date("2025-12-07T22:09:00"),
    ended_at: new Date("2025-12-07T22:28:00"),
    finish: true,
    rightQuestions: 17,
    questionOrder: Array.from({ length: 20 }, (_, i) => i + 1),
  },
  {
    id: "session-2",
    quiz_id: "1",
    user_id: "user-1",
    started_at: new Date("2025-12-06T14:30:00"),
    ended_at: new Date("2025-12-06T14:52:00"),
    finish: true,
    rightQuestions: 9,
    questionOrder: Array.from({ length: 20 }, (_, i) => i + 1),
  },
  {
    id: "session-3",
    quiz_id: "1",
    user_id: "user-1",
    started_at: new Date("2025-12-05T15:15:00"),
    ended_at: null,
    finish: false,
    rightQuestions: 6,
    questionOrder: Array.from({ length: 20 }, (_, i) => i + 1),
  },
];

export default function QuizOverview() {
  const { course_id, quiz_id } = useParams();
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const user = authUtils.getAuth().userData;
  const { showAlert } = useAlert();
  const router = useRouter();
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);

  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = async () => {
    try {
      // if (USE_MOCK_DATA) {
      //   setQuizData(MOCK_QUIZ_DATA);
      //   setQuizHistory(MOCK_QUIZ_HISTORY);
      //   return;
      // }

      const res = await api.get<QuizOverviewApiResponse>(
        `/courses/quizzes/${user?.id}/${quiz_id}`,
      );

      setQuizData(res.data.data.quiz);
      setQuizHistory(res.data.data.history ?? []);
    } catch (error) {
      setQuizData(MOCK_QUIZ_DATA);
      setQuizHistory(MOCK_QUIZ_HISTORY);
      console.error("Error fetching quiz data:", error);
      showAlert("Failed to load quiz details.", "error", {
        vertical: "bottom",
        horizontal: "left",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    router.push(`/authenticated/course/${course_id}/quiz/${quiz_id}/start`);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "No limit";
    const hours = Math.floor(minutes / 60);
    const remainMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}${remainMinutes > 0 ? ` ${remainMinutes} min` : ""}`;
    }
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  const formatAttemptTime = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getScorePercent = (attempt: QuizHistory) => {
    const totalQuestions = attempt.questionOrder.length;
    if (totalQuestions === 0) return 0;
    return Math.round((attempt.rightQuestions / totalQuestions) * 100);
  };

  const getAttemptStatus = (attempt: QuizHistory) => {
    if (!attempt.finish) return "in-progress";
    return getScorePercent(attempt) >= 50 ? "passed" : "failed";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Warning sx={{ fontSize: 18, color: "#f59e0b" }} />;
      case "passed":
        return <CheckCircle sx={{ fontSize: 18, color: "#10b981" }} />;
      case "failed":
        return <Cancel sx={{ fontSize: 18, color: "#ef4444" }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "warning";
      case "passed":
        return "success";
      case "failed":
        return "error";
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
          px: 4,
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

  if (!quizData) {
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
          Quiz not found
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
        px: 4,
      }}
    >
      <Box sx={{ pt: 4, mb: 2 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <Container maxWidth="xl">
        <Box>
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
              {quizData.title}
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
                      {formatDuration(quizData.time_limit)}
                    </Box>
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleStartQuiz}
                  sx={{
                    background:
                      "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                    color: "#fff",
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
                  {quizData.finish ? "Continue Quiz" : "Start Quiz"}
                </Button>
              </Paper>

              {/* Quiz Overview */}
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
                  Quiz Overview
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary", lineHeight: 1.8, mb: 4 }}
                >
                  {quizData.description ??
                    "No description available for this quiz."}
                </Typography>
              </Paper>
            </Box>

            {/* Right Column - Quiz History */}
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
                  Quiz History
                </Typography>

                {/* Quiz Attempts List */}
                <Box
                  sx={{
                    mb: 4,
                    p: 2,
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
                  }}
                >
                  {quizHistory.length > 0 ? (
                    <List sx={{ p: 0 }}>
                      {quizHistory.map((item, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            px: 0,
                            py: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 1,
                            borderBottom:
                              index !== quizHistory.length - 1
                                ? "1px solid"
                                : "none",
                            borderColor: "divider",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: 0.5,
                              width: "100%",
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatAttemptTime(item.started_at)}
                              </Typography>
                            </Box>
                            {item.ended_at && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ pl: 3 }}
                              >
                                Completed: {formatAttemptTime(item.ended_at)}
                              </Typography>
                            )}
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <Chip
                              icon={
                                getStatusIcon(getAttemptStatus(item)) ??
                                undefined
                              }
                              label={getAttemptStatus(item).replace("-", " ")}
                              size="small"
                              color={
                                getStatusColor(getAttemptStatus(item)) as any
                              }
                              sx={{
                                fontWeight: 500,
                                "& .MuiChip-label": {
                                  px: 1,
                                },
                              }}
                            />
                            {item.finish && (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color:
                                    getAttemptStatus(item) === "passed"
                                      ? "#10b981"
                                      : "#ef4444",
                                }}
                              >
                                Score: {getScorePercent(item)}% (
                                {item.rightQuestions}/
                                {item.questionOrder.length})
                              </Typography>
                            )}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", py: 4 }}
                    >
                      No quiz attempts yet
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
