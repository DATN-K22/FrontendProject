"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton,
  Divider,
  Skeleton,
  Avatar,
  Rating,
  Chip,
  SvgIcon,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Devices as DevicesIcon,
  CardMembership as CertificateIcon,
  ViewModule as ModuleIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Instagram as InstagramIcon,
  Telegram as TelegramIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Description as DescriptionIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useRouter } from "next/navigation";
import { useAlert } from "@/components/alert";
import api from "@/api/api";
enum CourseLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
  AllLevels = "All Levels",
}

type Course = {
  id: string;
  thumbnail_url: string;
  title: string;
  course_level: CourseLevel;
  short_description: string;
  long_description: string;
  created_at: string;
  user: {
    name: string;
    avt_url: string;
  };
  rating: number;
  price: number;
  isEnrolled: boolean;
};

type Chapter = {
  id: string;
  title: string;
  short_description: string;
  status: string;
  sort_order: number;
  lessons: Lesson[];
};

type Lesson = {
  id: string;
  title: string;
  status: string;
  type: string;
  sort_order: number;
  duration?: number;
  isFinished: boolean;
};

// Helper function to format duration (seconds to mm:ss)
const formatDuration = (seconds?: number): string => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to get icon based on lesson type
const getLessonIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "video":
      return <PlayCircleOutlineIcon sx={{ fontSize: 20, color: "#00bdd5" }} />;
    case "lab":
      return (
        <SvgIcon sx={{ fontSize: 20 }} viewBox="0 0 119.94 122.88">
          <g>
            <path
              fill="#262626"
              d="M115.19,28.94v6.92v7.38v7.38v24.05c0,3.64-1.49,6.94-3.88,9.33c-2.39,2.39-5.7,3.88-9.33,3.88c-3.64,0-6.94-1.48-9.34-3.88c-2.39-2.39-3.88-5.7-3.88-9.33V28.94h-2.79c-0.54,0-1.03-0.22-1.38-0.57c-0.26-0.34-0.42-0.75-0.42-1.21v-7.32c0-0.53,0.22-1.02,0.57-1.37c0.35-0.35,0.84-0.57,1.37-0.57h32.01c0.54,0,1.02,0.22,1.37,0.57c0.35,0.35,0.57,0.84,0.57,1.38v7.32c0,0.54-0.22,1.03-0.57,1.38c-0.33,0.26-0.75,0.41-1.19,0.41H115.19z"
            />
            <path
              fill="#262626"
              d="M34.71,33.47H60.8c2.04,0,3.69,1.65,3.69,3.69v18.98c0,0.65,0,0.42-0.02,1.35c-0.01,0.76,0,1.17,0.01,1.24c0.03,0.1,0.33,0.56,0.98,1.56l27.31,42c2.02,3.26,2.97,6.54,2.91,9.48c-0.04,1.86-0.47,3.57-1.28,5.08c-0.84,1.56-2.06,2.88-3.65,3.86c-1.97,1.23-4.49,1.92-7.51,1.9H18.52c-4.52,0.08-8.86,0.16-13.04-3.52c-2.36-2.08-3.73-4.86-3.71-8.18c0.01-2.72,1-5.71,3.22-8.82l27.24-42.62c0.43-0.67,0.59-0.85,0.61-0.91c0.02-0.08-0.02-0.18-0.03-0.67l-0.01-0.98l0.02-19.68C31.03,35.12,32.68,33.47,34.71,33.47z"
            />
            <path
              fill="#FEFDEF"
              d="M60.8,37.16H34.71l-0.02,20c0,2.85,0.22,2.39-1.31,4.78L6.21,104.47c-3.67,5.15-3.07,9.45-0.06,12.1c3.61,3.18,7.93,2.59,12.37,2.59h64.59c8.86,0.2,11.46-7,6.68-14.7L62.62,62.68c-2.13-3.28-1.82-2.62-1.82-6.54V37.16z"
            />
            <path
              fill="#B1E0E6"
              d="M14.97,90.68h65.81l8.96,13.77c4.78,7.7,2.18,14.9-6.68,14.7H18.47c-4.44,0-8.76,0.59-12.37-2.59c-3.01-2.65-3.61-6.95,0.06-12.1l8.81-13.79z"
            />
            <path
              fill="#78CDD4"
              d="M59.63,103.5c3.05,0,5.52,2.47,5.52,5.52s-2.47,5.52-5.52,5.52c-3.05,0-5.52-2.47-5.52-5.52S56.58,103.5,59.63,103.5z"
            />
            <path
              fill="#78CDD4"
              d="M78.36,103.42c1.17,0,2.11,0.94,2.11,2.11c0,1.17-0.94,2.11-2.11,2.11s-2.11-0.94-2.11-2.11C76.25,104.37,77.2,103.42,78.36,103.42z"
            />
            <path
              fill="#78CDD4"
              d="M61.78,83.51c2.12,0,3.83,1.71,3.83,3.83c0,2.12-1.71,3.83-3.83,3.83c-2.12,0-3.83-1.72-3.83-3.83C57.95,85.22,59.66,83.51,61.78,83.51z"
            />
            <path
              fill="#78CDD4"
              d="M41.47,105.07c1.13,0,2.04,0.91,2.04,2.04s-0.91,2.04-2.04,2.04s-2.04-0.91-2.04-2.04S40.35,105.07,41.47,105.07z"
            />
            <path
              fill="#78CDD4"
              d="M46.22,69.13c1.13,0,2.04,0.91,2.04,2.04s-0.91,2.04-2.04,2.04s-2.04-0.91-2.04-2.04S45.1,69.13,46.22,69.13z"
            />
            <path
              fill="#78CDD4"
              d="M45.84,83.75c1.43,0,2.6,1.16,2.6,2.6c0,1.43-1.16,2.59-2.6,2.59c-1.43,0-2.6-1.16-2.6-2.59C43.24,84.91,44.41,83.75,45.84,83.75z"
            />
            <path
              fill="#78CDD4"
              d="M44.03,12c2.12,0,3.83,1.72,3.83,3.83s-1.72,3.83-3.83,3.83s-3.83-1.72-3.83-3.83S41.92,12,44.03,12z"
            />
            <path
              fill="#78CDD4"
              d="M53.44,2.36c1.43,0,2.6,1.16,2.6,2.6c0,1.43-1.16,2.6-2.6,2.6c-1.43,0-2.6-1.16-2.6-2.6C50.84,3.52,52,2.36,53.44,2.36z"
            />
            <path
              fill="#FEFDEF"
              d="M33.82,28.33h28.2c2.43,0,4.41,1.98,4.41,4.41c0,2.43-1.98,4.41-4.41,4.41h-28.2c-2.43,0-4.41-1.98-4.41-4.41C29.4,30.32,31.39,28.33,33.82,28.33z"
            />
            <path
              fill="#FEFDEF"
              d="M112.21,52.14h-4.25c-0.84,0-1.52-0.69-1.52-1.52s0.68-1.52,1.52-1.52h4.25v-4.33h-7.98c-0.84,0-1.23-0.69-1.23-1.52c0-0.84,0.39-1.52,1.23-1.52h7.97v-4.33h-4.25c-0.84,0-1.52-0.69-1.52-1.52s0.69-1.52,1.52-1.52h4.25v-6.92c0-0.84,0.68-1.52,1.52-1.52h3.22v-5.13H87v5.13h3.22c0.84,0,1.52,0.69,1.52,1.52v47.32c0,2.79,1.14,5.33,2.99,7.18c1.84,1.84,4.46,2.99,7.25,2.99s5.4-1.14,7.25-2.99c1.84-1.84,2.99-4.39,2.99-7.18z"
            />
            <path
              fill="#B1E0E6"
              d="M108.96,56.89v16.47c0,3.84-3.14,6.98-6.98,6.98c-3.84,0-6.98-3.14-6.98-6.98V56.89z"
            />
            <path
              fill="#78CDD4"
              d="M97.87,49.58c0.97,0,1.75-0.79,1.75-1.75c0-0.97-0.79-1.75-1.75-1.75s-1.75,0.79-1.75,1.75C96.11,48.79,96.9,49.58,97.87,49.58z"
            />
            <path
              fill="#78CDD4"
              d="M102.17,53.99c0.66,0,1.19-0.53,1.19-1.19s-0.53-1.19-1.19-1.19s-1.19,0.53-1.19,1.19S101.51,53.99,102.17,53.99z"
            />
          </g>
        </SvgIcon>
      );
    case "quiz":
      return (
        <Box
          component="img"
          sx={{
            objectFit: "cover",
            width: 18,
            height: 18,
          }}
          src="/images/quiz.png"
        />
      );
    default:
      return <DescriptionIcon sx={{ fontSize: 20, color: "#757575" }} />;
  }
};

export default function CourseDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course>();
  const [chapters, setChapters] = useState<{
    progress: number;
    chapters: Chapter[];
  } | null>(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    // // Mock data for testing
    // const mockCourseData = {
    //   id: 1,
    //   thumbnail_url:
    //     "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    //   title: "Complete Web Development Bootcamp 2024",
    //   course_level: CourseLevel.Intermediate,
    //   short_description:
    //     "Master modern web development with HTML, CSS, JavaScript, React, Node.js and more in this comprehensive course.",
    //   long_description:
    //     "This complete web development bootcamp will take you from beginner to advanced level. You'll learn the latest technologies including HTML5, CSS3, JavaScript ES6+, React, Node.js, Express, MongoDB, and deployment strategies. Build real-world projects and gain the skills needed to become a professional web developer. Perfect for aspiring developers, career changers, and anyone looking to build modern web applications.",
    //   created_at: "2024-01-15T10:00:00Z",
    //   user: {
    //     name: "John Smith",
    //     avt_url: "https://i.pravatar.cc/150?img=12",
    //   },
    //   rating: 4.8,
    //   price: 49.99,
    //   progress: 5,

    //   sections: [
    //     {
    //       id: 1,
    //       resource_id: 1,
    //       title: "Introduction to Web Development",
    //       short_description: "Get started with the basics",
    //       long_description: "Learn the fundamentals of web development",
    //       status: "active",
    //       sort_order: 1,
    //       lessons: [
    //         {
    //           id: 1,
    //           title: "Welcome to the Course",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 1,
    //           duration: 420,
    //           resources: [],
    //         },
    //         {
    //           id: 2,
    //           title: "How the Web Works",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 2,
    //           duration: 680,
    //           resources: [],
    //         },
    //         {
    //           id: 3,
    //           title: "Setting Up Your Development Environment",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 3,
    //           duration: 540,
    //           resources: [],
    //         },
    //         {
    //           id: 4,
    //           title: "Course Resources",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "lab",
    //           sort_order: 4,
    //           resources: [],
    //         },
    //       ],
    //     },
    //     {
    //       id: 2,
    //       resource_id: 2,
    //       title: "HTML Fundamentals",
    //       short_description: "Master HTML5",
    //       long_description: "Deep dive into HTML5 elements and best practices",
    //       status: "active",
    //       sort_order: 2,
    //       lessons: [
    //         {
    //           id: 5,
    //           title: "HTML Basics and Structure",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 1,
    //           duration: 720,
    //           resources: [],
    //         },
    //         {
    //           id: 6,
    //           title: "Working with Text and Links",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 2,
    //           duration: 600,
    //           resources: [],
    //         },
    //         {
    //           id: 7,
    //           title: "Images and Multimedia",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 3,
    //           duration: 480,
    //           resources: [],
    //         },
    //         {
    //           id: 8,
    //           title: "HTML Forms",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 4,
    //           duration: 840,
    //           resources: [],
    //         },
    //         {
    //           id: 9,
    //           title: "HTML5 Semantic Elements",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 5,
    //           duration: 360,
    //           resources: [],
    //         },
    //         {
    //           id: 10,
    //           title: "HTML Quiz",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "quiz",
    //           sort_order: 6,
    //           resources: [],
    //         },
    //       ],
    //     },
    //     {
    //       id: 3,
    //       resource_id: 3,
    //       title: "CSS Styling and Layouts",
    //       short_description: "Style your websites beautifully",
    //       long_description:
    //         "Learn CSS3, Flexbox, Grid, and modern styling techniques",
    //       status: "active",
    //       sort_order: 3,
    //       lessons: [
    //         {
    //           id: 11,
    //           title: "CSS Basics and Selectors",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 1,
    //           duration: 900,
    //           resources: [],
    //         },
    //         {
    //           id: 12,
    //           title: "Box Model and Positioning",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 2,
    //           duration: 780,
    //           resources: [],
    //         },
    //         {
    //           id: 13,
    //           title: "Flexbox Complete Guide",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 3,
    //           duration: 1200,
    //           resources: [],
    //         },
    //         {
    //           id: 14,
    //           title: "CSS Grid Layout",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 4,
    //           duration: 1080,
    //           resources: [],
    //         },
    //         {
    //           id: 15,
    //           title: "Responsive Design",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 5,
    //           duration: 960,
    //           resources: [],
    //         },
    //         {
    //           id: 16,
    //           title: "CSS Cheat Sheet",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "lab",
    //           sort_order: 6,
    //           resources: [],
    //         },
    //       ],
    //     },
    //     {
    //       id: 4,
    //       resource_id: 4,
    //       title: "JavaScript Essentials",
    //       short_description: "Learn programming with JavaScript",
    //       long_description:
    //         "Master JavaScript from basics to advanced concepts",
    //       status: "active",
    //       sort_order: 4,
    //       lessons: [
    //         {
    //           id: 17,
    //           title: "JavaScript Introduction",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 1,
    //           duration: 540,
    //           resources: [],
    //         },
    //         {
    //           id: 18,
    //           title: "Variables and Data Types",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 2,
    //           duration: 720,
    //           resources: [],
    //         },
    //         {
    //           id: 19,
    //           title: "Functions and Scope",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 3,
    //           duration: 840,
    //           resources: [],
    //         },
    //         {
    //           id: 20,
    //           title: "Arrays and Objects",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 4,
    //           duration: 960,
    //           resources: [],
    //         },
    //         {
    //           id: 21,
    //           title: "DOM Manipulation",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 5,
    //           duration: 1140,
    //           resources: [],
    //         },
    //         {
    //           id: 22,
    //           title: "Event Handling",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 6,
    //           duration: 780,
    //           resources: [],
    //         },
    //         {
    //           id: 23,
    //           title: "JavaScript Practice Exercise",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "lab",
    //           sort_order: 7,
    //           resources: [],
    //         },
    //         {
    //           id: 24,
    //           title: "JavaScript Fundamentals Quiz",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "quiz",
    //           sort_order: 8,
    //           resources: [],
    //         },
    //       ],
    //     },
    //     {
    //       id: 5,
    //       resource_id: 5,
    //       title: "React Framework",
    //       short_description: "Build modern UIs with React",
    //       long_description:
    //         "Master React, hooks, state management and component architecture",
    //       status: "active",
    //       sort_order: 5,
    //       lessons: [
    //         {
    //           id: 25,
    //           title: "Introduction to React",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 1,
    //           duration: 600,
    //           resources: [],
    //         },
    //         {
    //           id: 26,
    //           title: "Components and Props",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 2,
    //           duration: 900,
    //           resources: [],
    //         },
    //         {
    //           id: 27,
    //           title: "State and Hooks",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 3,
    //           duration: 1020,
    //           resources: [],
    //         },
    //         {
    //           id: 28,
    //           title: "React Router",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 4,
    //           duration: 780,
    //           resources: [],
    //         },
    //         {
    //           id: 29,
    //           title: "API Integration",
    //           thumbnail_url: "",
    //           status: "active",
    //           type: "video",
    //           sort_order: 5,
    //           duration: 1200,
    //           resources: [],
    //         },
    //       ],
    //     },
    //   ],
    // };

    // Simulate loading

    const fetchCourse = async () => {
      try {
        setLoading(true);
        // Uncomment below to use real API
        // const res = await api.get(`/courses/chapters?course_id=${id}`);
        // setCourse(res.data.data);

        // Using mock data
        const courseResponse = await api.get(`/courses/course/${id}`);
        const chapterResponse = await api.get(
          `/courses/chapters?course_id=${id}`,
        );
        setCourse(courseResponse.data.data);
        setChapters(chapterResponse.data.data);
      } catch (error) {
        console.error("Error fetching course:", error);
        showAlert("Failed to fetch detail of the course", "error", {
          vertical: "bottom",
          horizontal: "left",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading || !course) {
    return (
      <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
        <Box sx={{ pl: 4 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <Container maxWidth="lg">
          {/* Skeleton for Header Image */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={400}
            sx={{ borderRadius: 2, mb: 3 }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            {/* Left Column Skeleton */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Skeleton
                  variant="text"
                  width="40%"
                  height={40}
                  sx={{ mb: 2 }}
                />

                {/* Progress Bar Skeleton */}
                <Box sx={{ mb: 3 }}>
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={20}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={8}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>

                {/* Course Sections Skeleton */}
                {[1, 2, 3].map((item) => (
                  <Paper
                    key={item}
                    sx={{
                      mb: 1,
                      p: 2,
                      border: "1px solid #e0e0e0",
                      boxShadow: "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Skeleton variant="text" width="40%" height={24} />
                      <Skeleton variant="circular" width={24} height={24} />
                    </Box>
                  </Paper>
                ))}
              </Paper>
            </Box>

            {/* Right Column Skeleton */}
            <Box sx={{ width: { xs: "100%", md: 350 } }}>
              {/* Price & Enroll Skeleton */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={50}
                  sx={{ mb: 2 }}
                />
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={50}
                  sx={{ borderRadius: 1, mb: 3 }}
                />

                <Divider sx={{ mb: 2 }} />

                <Skeleton
                  variant="text"
                  width="70%"
                  height={32}
                  sx={{ mb: 2 }}
                />

                {[1, 2, 3, 4].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width="70%" />
                  </Box>
                ))}
              </Paper>

              {/* Training Info Skeleton */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Skeleton
                  variant="text"
                  width="80%"
                  height={32}
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
              </Paper>

              {/* Share Section Skeleton */}
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={32}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Skeleton
                      key={item}
                      variant="circular"
                      width={40}
                      height={40}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  // Calculate total lessons
  // const totalLessons =
  //   course.sections?.reduce(
  //     (acc: number, section: Chapter) => acc + (section.lessons?.length || 0),
  //     0,
  //   ) || 0;

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Box sx={{ pl: 4 }}>
        <IconButton onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Container maxWidth="lg">
        {/* Header Image */}
        <Box
          component="img"
          src={
            course.thumbnail_url?.trim()
              ? course.thumbnail_url
              : "/images/no_image.jpg"
          }
          sx={{
            width: "100%",
            height: 400,
            objectFit: "cover",
            display: "block",
            borderRadius: 2,
            mb: 3,
          }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          {/* Left Column - Course Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Course Information Section */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              {/* Course Title */}
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {course.title}
              </Typography>

              {/* Course Level Chip */}
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={course.course_level}
                  size="small"
                  sx={{
                    bgcolor: "#e3f2fd",
                    color: "#1976d2",
                    fontWeight: 500,
                  }}
                />
              </Box>

              {/* Rating */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Rating
                  value={course.rating || 0}
                  precision={0.1}
                  readOnly
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  ({course.rating?.toFixed(1) || "0.0"})
                </Typography>
              </Box>

              {/* Creator Info */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Avatar
                  src={course.user?.avt_url?.trim() || undefined}
                  alt={course.user?.name ?? ""}
                  sx={{
                    bgcolor: "#151312",
                    width: 32,
                    height: 32,
                    mr: 1,
                  }}
                ></Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Created by
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {course.user?.name || "Unknown"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Short Description */}
              {course.short_description && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2, fontWeight: 500 }}
                  textAlign="justify"
                >
                  {course.short_description}
                </Typography>
              )}

              {/* Long Description */}
              {course.long_description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.7 }}
                  textAlign="justify"
                >
                  {course.long_description}
                </Typography>
              )}
            </Paper>

            {/* Course Content Section */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Course Content
              </Typography>

              {/* Progress Bar */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {chapters?.progress} COMPLETED
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={chapters?.progress || 0}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "#f0f0f0",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#ffd700",
                    },
                  }}
                />
              </Box>

              {/* Course Chapters/Sections */}
              {chapters?.chapters?.map((section: Chapter, index: number) => (
                <Accordion
                  key={section.id}
                  sx={{
                    mb: 1,
                    "&:before": { display: "none" },
                    boxShadow: "none",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      "&:hover": { bgcolor: "#f9f9f9" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        mr: 2,
                      }}
                    >
                      <Box>
                        <Typography fontWeight="500">
                          {section.title}
                        </Typography>
                        {section.short_description && (
                          <Typography variant="caption" color="text.secondary">
                            {section.short_description}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {section.lessons?.length || 0} Lessons
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: "#fafafa", p: 0 }}>
                    <List dense>
                      {section.lessons?.map((lesson: Lesson) => (
                        <ListItem
                          key={lesson.id}
                          sx={{
                            py: 1.5,
                            px: 2,
                            borderBottom: "1px solid #f0f0f0",
                            "&:last-child": { borderBottom: "none" },
                            "&:hover": { bgcolor: "#f5f5f5" },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {getLessonIcon(lesson.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={lesson.title}
                            primaryTypographyProps={{
                              variant: "body2",
                              fontWeight: 400,
                            }}
                          />
                          {lesson.type.toLowerCase() === "video" &&
                            lesson.duration && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  ml: 2,
                                }}
                              >
                                <AccessTimeIcon
                                  sx={{ fontSize: 16, color: "text.secondary" }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatDuration(lesson.duration)}
                                </Typography>
                              </Box>
                            )}
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Box>

          {/* Right Column - Course Info */}
          <Box sx={{ width: { xs: "100%", md: 350 } }}>
            {/* Price & Enroll */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {course.price ? `$${course.price}` : "Free"}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  bgcolor: "#ffd700",
                  color: "#000",
                  fontWeight: "bold",
                  py: 1.5,
                  mb: 3,
                  "&:hover": {
                    bgcolor: "#ffed4e",
                  },
                }}
              >
                Enroll now
              </Button>
            </Paper>

            {/* Training Info */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Training 5 or more people
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Class, launched less than a year ago by Blackboard co-founder
                Michael Chasen, integrates exclusively...
              </Typography>
            </Paper>

            {/* Share Section */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Share this course
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                <IconButton
                  sx={{
                    bgcolor: "#1da1f2",
                    color: "white",
                    "&:hover": { bgcolor: "#1a8cd8" },
                  }}
                  size="small"
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  sx={{
                    bgcolor: "#ff0000",
                    color: "white",
                    "&:hover": { bgcolor: "#cc0000" },
                  }}
                  size="small"
                >
                  <YouTubeIcon />
                </IconButton>
                <IconButton
                  sx={{
                    bgcolor: "#E4405F",
                    color: "white",
                    "&:hover": { bgcolor: "#d62954" },
                  }}
                  size="small"
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton
                  sx={{
                    bgcolor: "#0088cc",
                    color: "white",
                    "&:hover": { bgcolor: "#0077b3" },
                  }}
                  size="small"
                >
                  <TelegramIcon />
                </IconButton>
                <IconButton
                  sx={{
                    bgcolor: "#25D366",
                    color: "white",
                    "&:hover": { bgcolor: "#20ba5a" },
                  }}
                  size="small"
                >
                  <WhatsAppIcon />
                </IconButton>
                <IconButton
                  sx={{
                    bgcolor: "#4267B2",
                    color: "white",
                    "&:hover": { bgcolor: "#3b5998" },
                  }}
                  size="small"
                >
                  <FacebookIcon />
                </IconButton>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
