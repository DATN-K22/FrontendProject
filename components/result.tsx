"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { EmojiEvents, Replay, CheckCircle, Cancel } from "@mui/icons-material";
import { Question } from "./quizData";

interface ResultsProps {
  questions: Question[];
  answers: (number | null)[];
  onRestart: () => void;
}

export default function Results({
  questions,
  answers,
  onRestart,
}: ResultsProps) {
  const theme = useTheme();
  const score = answers.filter(
    (a, i) => a === questions[i].correctAnswer,
  ).length;
  const total = questions.length;
  const pct = Math.round((score / total) * 100);

  const getMessage = () => {
    if (pct === 100) return { text: "Perfect Score! 🏆", color: "#FFCC00" };
    if (pct >= 80) return { text: "Excellent Work! 🎉", color: "#22c55e" };
    if (pct >= 60) return { text: "Good Job! 👍", color: "#60a5fa" };
    if (pct >= 40) return { text: "Keep Practicing! 📚", color: "#fb923c" };
    return { text: "Don't Give Up! 💪", color: "#ef4444" };
  };

  const msg = getMessage();

  return (
    <Box
      sx={{
        animation: "fadeSlideUp 0.5s ease",
        "@keyframes fadeSlideUp": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Score card */}
      <Card sx={{ borderRadius: 4, mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            height: 5,
            background: `linear-gradient(90deg, #FFCC00, ${msg.color})`,
          }}
        />
        <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
          <EmojiEvents sx={{ fontSize: 64, color: "#FFCC00", mb: 2 }} />
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
            {msg.text}
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 1,
              mt: 2,
              mb: 1,
            }}
          >
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{ color: msg.color, fontSize: { xs: "3rem", sm: "4rem" } }}
            >
              {pct}%
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You answered {score} out of {total} questions correctly
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={`✓ ${score} Correct`}
              sx={{
                background: "#22c55e22",
                color: "#22c55e",
                fontWeight: 700,
                border: "1px solid #22c55e44",
                px: 1,
              }}
            />
            <Chip
              label={`✗ ${total - score} Wrong`}
              sx={{
                background: "#ef444422",
                color: "#ef4444",
                fontWeight: 700,
                border: "1px solid #ef444444",
                px: 1,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Answer review */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Answer Review
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {questions.map((q, i) => {
              const correct = answers[i] === q.correctAnswer;
              return (
                <Box
                  key={q.id}
                  sx={{
                    display: "flex",
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: correct ? "#22c55e11" : "#ef444411",
                    border: correct
                      ? "1px solid #22c55e33"
                      : "1px solid #ef444433",
                  }}
                >
                  {correct ? (
                    <CheckCircle
                      sx={{ color: "#22c55e", mt: 0.2, flexShrink: 0 }}
                    />
                  ) : (
                    <Cancel sx={{ color: "#ef4444", mt: 0.2, flexShrink: 0 }} />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      fontWeight={600}
                      sx={{ fontSize: "0.9rem", mb: 0.5 }}
                    >
                      Q{i + 1}: {q.question}
                    </Typography>
                    {!correct && (
                      <Typography sx={{ fontSize: "0.8rem", color: "#22c55e" }}>
                        ✓ {q.options[q.correctAnswer]}
                      </Typography>
                    )}
                    {!correct && answers[i] !== null && (
                      <Typography sx={{ fontSize: "0.8rem", color: "#ef4444" }}>
                        ✗ Your answer:{" "}
                        {answers[i] !== null
                          ? q.options[answers[i]!]
                          : "No answer"}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={<Replay />}
        onClick={onRestart}
        sx={{ py: 2 }}
      >
        Try Again
      </Button>
    </Box>
  );
}
