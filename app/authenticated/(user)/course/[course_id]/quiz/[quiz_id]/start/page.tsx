"use client";

import api from "@/api/api";
import QuizContainer from "@/components/quizContainer";
import { authUtils } from "@/utils/auth";
import { Box, Container } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function QuizStart() {
  const { quiz_id } = useParams();
  const userData = authUtils.getAuth().userData;

  useEffect(() => {
    const fetchLabQuestion = async () => {
      try {
        const response = await api.post(
          `/courses/quizzes/${userData.id}/${quiz_id}`,
        );
      } catch (error) {
        console.error("Failed to start the quiz.", error);
      }
    };
    console.log("Starting quiz with ID:", quiz_id);
    fetchLabQuestion();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
        px: 4,
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <QuizContainer />
      </Container>
    </Box>
  );
}
