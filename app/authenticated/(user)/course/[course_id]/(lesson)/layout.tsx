"use client";
import api from "@/api/api";
import CourseTOC from "@/components/courseTOC";
import { authUtils } from "@/utils/auth";
import { Box } from "@mui/material";
import { createContext, useCallback, useContext, useState } from "react";

type VideoProgressContextType = {
  handleProgress90: (lessonId: string, courseId: string) => void;
  tocVersion: number;
};

const VideoProgressContext = createContext<VideoProgressContextType | null>(
  null,
);

export function useVideoProgress() {
  const context = useContext(VideoProgressContext);
  if (!context) throw new Error("useVideoProgress must be used within layout");
  return context;
}

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userData } = authUtils.getAuth();
  const handleProgress90 = useCallback(
    async (lessonId: string, courseId: string) => {
      try {
        await api.patch(
          `/courses/lessons/${userData?.id}/${courseId}/${lessonId}/status`,
        );

        setTocVersion((v) => v + 1);
      } catch (error) {
        console.error(error);
      }
    },
    [],
  );
  const [tocVersion, setTocVersion] = useState(0);
  return (
    <VideoProgressContext.Provider value={{ handleProgress90, tocVersion }}>
      <Box
        sx={{
          display: "flex",
          background: "linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)",
          gap: 1,
          py: 4,
          px: 4,
        }}
      >
        <Box
          sx={{
            flex: 1,
          }}
        >
          {children}
        </Box>

        <CourseTOC></CourseTOC>
      </Box>
    </VideoProgressContext.Provider>
  );
}
