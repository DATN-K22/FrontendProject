"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Skeleton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Question } from "./quizData";
import AnswerOption from "./answerOption";

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  revealed: boolean;
  onSelect: (index: number) => void;
  visible: boolean;
  loading?: boolean;
}

const LABELS = ["A", "B", "C", "D"];

const categoryColors: Record<string, string> = {
  Science: "#4ade80",
  Geography: "#60a5fa",
  Art: "#f472b6",
  History: "#fb923c",
  Mathematics: "#a78bfa",
  Technology: "#34d399",
  Literature: "#fbbf24",
};

export default function QuestionCard({
  question,
  selectedAnswer,
  revealed,
  onSelect,
  visible,
  loading = false,
}: QuestionCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const catColor = categoryColors[question.category] || "#FFCC00";

  if (loading) {
    return (
      <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Skeleton variant="rounded" width={80} height={28} sx={{ mb: 3 }} />
          <Skeleton variant="text" sx={{ fontSize: "1.5rem", mb: 1 }} />
          <Skeleton
            variant="text"
            sx={{ fontSize: "1.5rem", mb: 4, width: "60%" }}
          />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={60}
              sx={{ mb: 1.5, borderRadius: 3 }}
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.98)",
        transition:
          "opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)",
        position: "relative",
      }}
    >
      {/* Top accent bar */}
      <Box
        sx={{
          height: 5,
          background: `linear-gradient(90deg, ${catColor}, #FFCC00)`,
        }}
      />

      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        {/* Category chip */}
        <Box sx={{ mb: 2.5 }}>
          <Chip
            label={question.category}
            size="small"
            sx={{
              background: `${catColor}22`,
              color: catColor,
              border: `1px solid ${catColor}44`,
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />
        </Box>

        {/* Question text */}
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            lineHeight: 1.5,
            color: theme.palette.text.primary,
            fontWeight: 700,
          }}
        >
          {question.question}
        </Typography>

        {/* Answer options */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {question.options.map((option, index) => {
            let correctState: boolean | null = null;
            if (revealed) {
              if (index === question.correctAnswer) correctState = true;
              else if (
                index === selectedAnswer &&
                index !== question.correctAnswer
              )
                correctState = false;
            }

            return (
              <AnswerOption
                key={index}
                label={LABELS[index]}
                text={option}
                selected={selectedAnswer === index}
                correct={correctState}
                disabled={revealed}
                onClick={() => onSelect(index)}
              />
            );
          })}
        </Box>

        {/* Feedback message */}
        {revealed && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              background:
                selectedAnswer === question.correctAnswer
                  ? "linear-gradient(135deg, #22c55e22, #16a34a11)"
                  : "linear-gradient(135deg, #ef444422, #dc262611)",
              border:
                selectedAnswer === question.correctAnswer
                  ? "1px solid #22c55e44"
                  : "1px solid #ef444444",
              textAlign: "center",
              animation: "fadeIn 0.3s ease",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "translateY(4px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color:
                  selectedAnswer === question.correctAnswer
                    ? "#22c55e"
                    : "#ef4444",
              }}
            >
              {selectedAnswer === question.correctAnswer
                ? "✓ Correct! Well done!"
                : `✗ Incorrect. The answer is: ${question.options[question.correctAnswer]}`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
