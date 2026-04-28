"use client";

import { Box, Typography } from "@mui/material";
import { Timer } from "@mui/icons-material";
import { useEffect, useState } from "react";

interface TimerProps {
  duration: number; // seconds
  onExpire: () => void;
  running: boolean;
  resetKey: number;
}

export default function QuizTimer({
  duration,
  onExpire,
  running,
  resetKey,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [resetKey, duration]);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      onExpire();
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, running, onExpire]);

  const pct = timeLeft / duration;
  const color = pct > 0.5 ? "#22c55e" : pct > 0.25 ? "#FFCC00" : "#ef4444";
  const urgent = timeLeft <= 5;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: 3,
        background: `${color}22`,
        border: `2px solid ${color}44`,
        animation: urgent ? "pulse 0.8s ease-in-out infinite" : "none",
        "@keyframes pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        transition: "all 0.5s ease",
      }}
    >
      <Timer sx={{ color, fontSize: 20 }} />
      <Typography
        fontWeight={800}
        sx={{ color, fontVariantNumeric: "tabular-nums", fontSize: "1.1rem" }}
      >
        {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
        {String(timeLeft % 60).padStart(2, "0")}
      </Typography>
    </Box>
  );
}
