"use client";

import api from "@/api/api";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import ComputerIcon from "@mui/icons-material/Computer";
import StorageIcon from "@mui/icons-material/Storage";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import { useRouter } from "next/navigation";

/*=== Define type ===*/
type RelearningCourse = {
  id: number;
  thumbnail_url: string;
  title: string;
  user: {
    name: string;
    avatar_url: string;
  };
  progress: number;
  currentLesson: number;
  totalLessons: number;
};

enum CourseLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
  AllLevels = "All Levels",
}

export default function HomePage() {
  /*=== UseState hooks ===*/
  const [reLearningCourse, setRelearningCourse] = useState<
    RelearningCourse[] | null
  >(null);
  const router = useRouter();

  /*=== UseEffect hooks ===*/
  useEffect(() => {
    const fetchRelearningCourse = async () => {
      try {
        const res = {
          data: [
            {
              id: 1,
              thumbnail_url: "https://example.com/course1.jpg",
              title: "AWS Certified Solutions Architect",
              user: {
                name: "Lina",
                avatar_url: "https://example.com/instructor1.jpg",
              },
              progress: 70,
              currentLesson: 5,
              totalLessons: 7,
            },
            {
              id: 2,
              thumbnail_url: "https://example.com/course1.jpg",
              title: "AWS Certified Solutions Architect",
              user: {
                name: "Lina",
                avatar_url: "https://example.com/instructor1.jpg",
              },
              progress: 70,
              currentLesson: 5,
              totalLessons: 7,
            },
            {
              id: 3,
              thumbnail_url: "https://example.com/course1.jpg",
              title: "AWS Certified Solutions Architect",
              user: {
                name: "Lina",
                avatar_url: "https://example.com/instructor1.jpg",
              },
              progress: 70,
              currentLesson: 5,
              totalLessons: 7,
            },
          ],
        };
        setRelearningCourse(res.data);
      } catch (error) {
        console.log("Error fetching relearning course:", error);
      }
    };
    fetchRelearningCourse();
  }, []);

  /*=== Component ===*/
  const ReLearningCourseList = () => {
    return (
      <Box
        sx={{
          background: "#FAF9F4",
          py: { xs: 4, md: 5 },
          px: { xs: 2, sm: 3, md: 6 },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              color: "#1a1a1a",
            }}
          >
            Continue Learning
          </Typography>
          <Typography
            component="a"
            href="#"
            sx={{
              color: "#FFD600",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              whiteSpace: "nowrap",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View history
          </Typography>
        </Box>

        {/* Course Grid */}
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {reLearningCourse?.map((course) => (
            <Grid key={course.id} size={{ xs: 4, sm: 4, md: 4 }}>
              <Box
                component="button"
                onClick={() => {
                  router.push(`/course/${course.id}`);
                }}
                sx={{
                  borderRadius: 4,
                  bgcolor: "#fff",
                  p: 2,
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                  height: "100%",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={course.thumbnail_url}
                  alt={course.title}
                  sx={{
                    borderRadius: 3,
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    mb: 2,
                    bgcolor: "#ddd",
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    mb: 1.5,
                    color: "#1a1a1a",
                    textAlign: "left",
                  }}
                >
                  {course.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    component="img"
                    src={course.user.avatar_url}
                    alt={course.user.name}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      mr: 1,
                      bgcolor: "#ccc",
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.9375rem",
                      color: "#333",
                    }}
                  >
                    {course.user.name}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                {/* Progress Bar */}
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        height: 7,
                        borderRadius: 4,
                        background: "#eee",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${course.progress}%`,
                          height: "100%",
                          background: "#FFD600",
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: "#888",
                    whiteSpace: "nowrap",
                    textAlign: "right",
                    mt: 0.5,
                  }}
                >
                  Lesson {course.currentLesson} of {course.totalLessons}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const CourseCategories = () => {
    const categories = [
      {
        id: 1,
        title: CourseLevel.Beginner,
        icon: <SchoolIcon sx={{ fontSize: 40 }} />,
        bgColor: "#D4F1F4",
        iconColor: "#4DB8C4",
      },
      {
        id: 2,
        title: CourseLevel.Intermediate,
        icon: <DesignServicesIcon sx={{ fontSize: 40 }} />,
        bgColor: "#D4DEF4",
        iconColor: "#5B7BC4",
      },
      {
        id: 3,
        title: CourseLevel.Advanced,
        icon: <ComputerIcon sx={{ fontSize: 40 }} />,
        bgColor: "#D4E8F4",
        iconColor: "#5BA5C4",
      },
      {
        id: 4,
        title: CourseLevel.Expert,
        icon: <StorageIcon sx={{ fontSize: 40 }} />,
        bgColor: "#FFE8D6",
        iconColor: "#FF8C42",
      },
      {
        id: 5,
        title: CourseLevel.AllLevels,
        icon: <WorkIcon sx={{ fontSize: 40 }} />,
        bgColor: "#B8F2E6",
        iconColor: "#3DB69A",
      },
    ];

    return (
      <Box
        sx={{
          py: { xs: 4, md: 5 },
          px: { xs: 2, sm: 3, md: 6 },
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container maxWidth="xl">
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                color: "#1a1a1a",
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              Choice favourite course from top category
            </Typography>
            <Typography
              sx={{
                color: "#FFD600",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              View All
            </Typography>
          </Box>

          {/* Cards Grid - 5 items per row */}
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={category.id}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    {/* Icon Box */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        backgroundColor: category.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                        color: category.iconColor,
                      }}
                    >
                      {category.icon}
                    </Box>

                    {/* Title */}
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#1a1a1a",
                        fontSize: "1.125rem",
                      }}
                    >
                      {category.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  };

  const RecommendedCourse = () => {
    const recommendedCourses = [
      {
        id: 1,
        thumbnail_url: "https://example.com/course1.jpg",
        category: "Design",
        duration: "3 Month",
        title: "AWS Certified solutions Architect",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        instructor: {
          name: "Lina",
          avatar_url: "https://example.com/instructor1.jpg",
        },
        price: 100000,
        currency: "VND",
      },
      {
        id: 2,
        thumbnail_url: "https://example.com/course2.jpg",
        category: "Design",
        duration: "3 Month",
        title: "AWS Certified solutions Architect",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        instructor: {
          name: "Lina",
          avatar_url: "https://example.com/instructor2.jpg",
        },
        price: 0,
        currency: "VND",
      },
      {
        id: 3,
        thumbnail_url: "https://example.com/course3.jpg",
        category: "Design",
        duration: "3 Month",
        title: "AWS Certified solutions Architect",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        instructor: {
          name: "Lina",
          avatar_url: "https://example.com/instructor3.jpg",
        },
        price: 0,
        currency: "VND",
      },
      {
        id: 4,
        thumbnail_url: "https://example.com/course4.jpg",
        category: "Design",
        duration: "3 Month",
        title: "AWS Certified solutions Architect",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
        instructor: {
          name: "Lina",
          avatar_url: "https://example.com/instructor4.jpg",
        },
        price: 0,
        currency: "VND",
      },
    ];

    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#FAF9F4",
          py: { xs: 4, md: 5 },
          px: { xs: 2, sm: 3, md: 6 },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: { xs: "1.25rem", md: "1.5rem" },
              color: "#000000",
            }}
          >
            Recommended for you
          </Typography>
          <Typography
            component="a"
            href="#"
            sx={{
              color: "#FFD600",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              whiteSpace: "nowrap",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            See all
          </Typography>
        </Box>

        {/* Course Grid */}
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {recommendedCourses.map((course) => (
            <Grid key={course.id} size={{ xs: 4, sm: 4, md: 3 }}>
              <Box
                component="button"
                onClick={() => {
                  router.push(`/course/${course.id}`);
                }}
                sx={{
                  borderRadius: 4,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                  bgcolor: "#fff",
                  p: 2.5,
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                  height: "100%",
                  border: "none",
                  textAlign: "left",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                    cursor: "pointer",
                    transform: "translateY(-4px)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                {/* Thumbnail */}
                <Box
                  component="img"
                  src={course.thumbnail_url}
                  alt={course.title}
                  sx={{
                    borderRadius: 3,
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    mb: 2,
                    bgcolor: "#ddd",
                  }}
                />

                {/* Category and Duration */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      component="span"
                      sx={{
                        width: 16,
                        height: 16,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#999"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                      </svg>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#999",
                        fontWeight: 400,
                      }}
                    >
                      {course.category}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Box
                      component="span"
                      sx={{
                        width: 16,
                        height: 16,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#999"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "#999",
                        fontWeight: 400,
                      }}
                    >
                      {course.duration}
                    </Typography>
                  </Box>
                </Box>

                {/* Title */}
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    mb: 1.5,
                    color: "#1a1a1a",
                    lineHeight: 1.4,
                  }}
                >
                  {course.title}
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "#666",
                    mb: 2,
                    lineHeight: 1.6,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {course.description}
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                {/* Footer: Instructor and Price */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pt: 2,
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      component="img"
                      src={course.instructor.avatar_url}
                      alt={course.instructor.name}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        mr: 1,
                        bgcolor: "#ccc",
                      }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        color: "#333",
                      }}
                    >
                      {course.instructor.name}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.125rem",
                      color: "#FFD600",
                    }}
                  >
                    {course.price === 0
                      ? `0 ${course.currency}`
                      : `${course.price.toLocaleString()} ${course.currency}`}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <ReLearningCourseList />
      <CourseCategories />
      <RecommendedCourse />
    </Box>
  );
}
