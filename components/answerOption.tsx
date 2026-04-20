"use client";

import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CheckCircle, Cancel } from "@mui/icons-material";

interface AnswerOptionProps {
  label: string;
  text: string;
  selected: boolean;
  correct: boolean | null; // null = not revealed yet
  disabled: boolean;
  onClick: () => void;
}

export default function AnswerOption({
  label,
  text,
  selected,
  correct,
  disabled,
  onClick,
}: AnswerOptionProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const getBg = () => {
    if (correct === true)
      return "linear-gradient(135deg, #22c55e22, #16a34a22)";
    if (correct === false && selected)
      return "linear-gradient(135deg, #ef444422, #dc262622)";
    if (selected) return `linear-gradient(135deg, #FFCC0033, #FFCC0022)`;
    return isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)";
  };

  const getBorder = () => {
    if (correct === true) return "2px solid #22c55e";
    if (correct === false && selected) return "2px solid #ef4444";
    if (selected) return "2px solid #FFCC00";
    return isDark
      ? "2px solid rgba(255,255,255,0.1)"
      : "2px solid rgba(0,0,0,0.08)";
  };

  const getIconColor = () => {
    if (correct === true) return "#22c55e";
    if (correct === false && selected) return "#ef4444";
    return "#FFCC00";
  };

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        cursor: disabled ? "default" : "pointer",
        background: getBg(),
        border: getBorder(),
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: selected ? "scale(1.01)" : "scale(1)",
        "&:hover": !disabled
          ? {
              background: isDark
                ? "rgba(255,204,0,0.12)"
                : "rgba(255,204,0,0.15)",
              border: "2px solid #FFCC00",
              transform: "scale(1.01) translateX(4px)",
              boxShadow: "0 4px 16px rgba(255,204,0,0.2)",
            }
          : {},
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Label bubble */}
      <Box
        sx={{
          minWidth: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            selected || correct !== null
              ? getIconColor()
              : isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.06)",
          color:
            selected || correct !== null ? "#000" : theme.palette.text.primary,
          fontWeight: 800,
          fontSize: "0.85rem",
          flexShrink: 0,
          transition: "all 0.25s ease",
        }}
      >
        {correct === true ? (
          <CheckCircle sx={{ fontSize: 20, color: "#fff" }} />
        ) : correct === false && selected ? (
          <Cancel sx={{ fontSize: 20, color: "#fff" }} />
        ) : (
          label
        )}
      </Box>

      <Typography
        variant="body1"
        sx={{
          flex: 1,
          fontWeight: selected ? 700 : 500,
          color: theme.palette.text.primary,
          lineHeight: 1.4,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
