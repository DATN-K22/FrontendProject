import * as React from "react";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface Props extends CircularProgressProps {
  value: number;
  textColor?: string;
  progressColor?: string;
}

export default function CircularProgressWithLabel({
  value,
  textColor = "#ffd700",
  progressColor = "#ffd700",
  ...rest
}: Props) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={value}
        sx={{
          color: progressColor,
        }}
        {...rest}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="subtitle2"
          component="div"
          sx={{ color: textColor }}
        >
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}
