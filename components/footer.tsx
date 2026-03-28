import { Box, Button, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#252641",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        py: { xs: 8, md: 14 },
        px: 2,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 700,
          maxWidth: 1100,
          fontSize: { xs: "1.6rem", md: "2.6rem", lg: "3rem" },
          lineHeight: 1.08,
        }}
      >
        AI-Powered Online Learning Platform with Virtual Assistant
      </Typography>

      <Typography
        variant="h6"
        sx={{
          mt: 3,
          maxWidth: 900,
          color: "rgba(255,255,255,0.82)",
          fontSize: { xs: "0.98rem", md: "1.1rem" },
        }}
      >
        Build real-world cloud expertise with hands-on AWS labs, architecture
        best practices, and AI-powered guidance whenever you need support.
      </Typography>

      <Button
        variant="contained"
        sx={{
          bgcolor: "#FFCC00",
          color: "#000",
          mt: 6,
          px: 4,
          py: 1.5,
          borderRadius: "9999px",
          fontWeight: 700,
          boxShadow: "none",
          textTransform: "none",
          "&:hover": { bgcolor: "#f2b800", boxShadow: "none" },
        }}
      >
        Start chatbot now
      </Button>
    </Box>
  );
}
