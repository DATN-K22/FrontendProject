"use client";

import { useReducer, useCallback, useState, useEffect } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ArrowBack,
  ArrowForward,
  Check,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import { quizData } from "./quizData";
import Results from "./result";
import QuizTimer from "./quizTimer";
import QuestionCard from "./questionCard";
interface QuizState {
  currentIndex: number;
  answers: (number | null)[];
  revealed: boolean[];
  finished: boolean;
}

type Action =
  | { type: "SELECT"; answerIndex: number }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "SUBMIT" }
  | { type: "RESTART" }
  | { type: "TIMEOUT" };

function reducer(state: QuizState, action: Action): QuizState {
  const total = quizData.length;
  switch (action.type) {
    case "SELECT": {
      if (state.revealed[state.currentIndex]) return state;
      const answers = [...state.answers];
      const revealed = [...state.revealed];
      answers[state.currentIndex] = action.answerIndex;
      revealed[state.currentIndex] = true;
      return { ...state, answers, revealed };
    }
    case "NEXT":
      if (state.currentIndex >= total - 1) return state;
      return { ...state, currentIndex: state.currentIndex + 1 };
    case "PREV":
      if (state.currentIndex <= 0) return state;
      return { ...state, currentIndex: state.currentIndex - 1 };
    case "SUBMIT":
      return { ...state, finished: true };
    case "TIMEOUT": {
      const revealed = [...state.revealed];
      revealed[state.currentIndex] = true;
      return { ...state, revealed };
    }
    case "RESTART":
      return {
        currentIndex: 0,
        answers: Array(total).fill(null),
        revealed: Array(total).fill(false),
        finished: false,
      };
    default:
      return state;
  }
}

const TIMER_DURATION = 20;

export default function QuizContainer() {
  const theme = useTheme();
  const total = quizData.length;

  const [state, dispatch] = useReducer(reducer, {
    currentIndex: 0,
    answers: Array(total).fill(null),
    revealed: Array(total).fill(false),
    finished: false,
  });

  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const navigate = (direction: "next" | "prev") => {
    setVisible(false);
    setTimeout(() => {
      dispatch({ type: direction === "next" ? "NEXT" : "PREV" });
      setTimerKey((k) => k + 1);
      setVisible(true);
    }, 200);
  };

  const handleSelect = (index: number) =>
    dispatch({ type: "SELECT", answerIndex: index });

  const handleTimeout = useCallback(() => {
    dispatch({ type: "TIMEOUT" });
  }, []);

  const isLast = state.currentIndex === total - 1;
  const progress = ((state.currentIndex + 1) / total) * 100;
  const q = quizData[state.currentIndex];

  if (state.finished) {
    return (
      <Box>
        <Results
          questions={quizData}
          answers={state.answers}
          onRestart={() => {
            dispatch({ type: "RESTART" });
            setTimerKey((k) => k + 1);
            setVisible(true);
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}
          >
            Quiz
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Test your knowledge
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <QuizTimer
            duration={TIMER_DURATION}
            onExpire={handleTimeout}
            running={!state.revealed[state.currentIndex]}
            resetKey={timerKey}
          />
        </Box>
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" fontWeight={700} color="text.secondary">
            Question {state.currentIndex + 1} of {total}
          </Typography>
          <Typography variant="body2" fontWeight={700} color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ transition: "value 0.5s ease" }}
        />
      </Box>

      {/* Question dots */}
      <Box sx={{ display: "flex", gap: 0.75, mb: 3, flexWrap: "wrap" }}>
        {quizData.map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              transition: "all 0.3s ease",
              background:
                i === state.currentIndex
                  ? "#FFCC00"
                  : state.revealed[i]
                    ? state.answers[i] === quizData[i].correctAnswer
                      ? "#22c55e"
                      : "#ef4444"
                    : "rgba(0,0,0,0.1)",
              transform: i === state.currentIndex ? "scale(1.4)" : "scale(1)",
              boxShadow:
                i === state.currentIndex
                  ? "0 0 8px rgba(255,204,0,0.6)"
                  : "none",
            }}
          />
        ))}
      </Box>

      {/* Question card */}
      <QuestionCard
        question={q}
        selectedAnswer={state.answers[state.currentIndex]}
        revealed={state.revealed[state.currentIndex]}
        onSelect={handleSelect}
        visible={visible}
        loading={loading}
      />

      {/* Navigation */}
      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("prev")}
          disabled={state.currentIndex === 0}
          sx={{
            flex: 1,
            py: 1.5,
            borderColor: "rgba(0,0,0,0.15)",
            color: theme.palette.text.primary,
            "&:hover": {
              borderColor: "#FFCC00",
              color: "#FFCC00",
              background: "rgba(255,204,0,0.08)",
            },
            "&:disabled": { opacity: 0.3 },
          }}
        >
          Previous
        </Button>

        {isLast ? (
          <Button
            variant="contained"
            endIcon={<Check />}
            onClick={() => dispatch({ type: "SUBMIT" })}
            disabled={!state.revealed[state.currentIndex]}
            sx={{ flex: 2, py: 1.5 }}
          >
            Submit Quiz
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => navigate("next")}
            disabled={!state.revealed[state.currentIndex]}
            sx={{ flex: 2, py: 1.5 }}
          >
            Next Question
          </Button>
        )}
      </Box>
    </Box>
  );
}
