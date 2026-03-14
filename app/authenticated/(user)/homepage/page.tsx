"use client";

import api from "@/api/api";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import ComputerIcon from "@mui/icons-material/Computer";
import StorageIcon from "@mui/icons-material/Storage";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import { useRouter } from "next/navigation";
import { useAlert } from "@/components/Alert";
import { ApiResponse } from "@/utils/dto/ApiResponse";

/*=== Define type ===*/
type RelearningCourse = {
  id: string;
  thumbnail_url: string;
  title: string;
  user: {
    name: string;
    avt_url: string;
  };
  progress: number;
};

enum CourseLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
  AllLevels = "All Levels",
}

type RecommendedCourse = {
  id: string;
  thumbnail_url: string;
  title: string;
  course_level: CourseLevel;
  short_description: string;
  user: {
    name: string;
    avt_url: string;
  };
  rating: number;
  price: number;
};

export default function HomePage() {
  /*=== UseState hooks ===*/
  const [reLearningCourse, setRelearningCourse] = useState<
    RelearningCourse[] | null
  >(null);

  const [recommendationCourse, setRecommendationCourse] = useState<
    RecommendedCourse[] | null
  >(null);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  /*=== UseEffect hooks ===*/
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const incompleteCourses = await api.get(
          "/courses/course/me/latest-incomplete?limit=3",
        );
        const recommendationCourses: { data: { data: RecommendedCourse[] } } =
          await api.get("/courses/course/me/recommendation?offset=0&limit=8");
        setRelearningCourse(incompleteCourses.data.data);
        setRecommendationCourse(recommendationCourses.data.data);
      } catch (error) {
        console.log("Error fetching relearning course:", error);
        showAlert("Fail to fetch content for homepage");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  /*=== Component ===*/
  const ReLearningCourseList = ({ loading }: { loading: boolean }) => {
    const skeletonArray = Array.from({ length: 3 });
    const isSkeleton = loading || !reLearningCourse;

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
          {(isSkeleton ? skeletonArray : reLearningCourse).map(
            (course: any, index: number) => {
              return (
                <Grid
                  key={isSkeleton ? index : course.id}
                  size={{ xs: 4, sm: 4, md: 4 }}
                >
                  <Box
                    component={isSkeleton ? "div" : "button"}
                    onClick={
                      isSkeleton
                        ? undefined
                        : () =>
                            router.push(`/authenticated/course/${course.id}`)
                    }
                    sx={{
                      borderRadius: 4,
                      bgcolor: "#fff",
                      p: 2,
                      display: "flex",
                      width: "100%",
                      flexDirection: "column",
                      height: "100%",
                      border: "none",
                      boxShadow: isSkeleton
                        ? "0 2px 8px rgba(0,0,0,0.08)"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      textAlign: "left",
                      ...(isSkeleton
                        ? {}
                        : {
                            cursor: "pointer",
                            "&:hover": {
                              transform: "translateY(-8px)",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            },
                          }),
                    }}
                  >
                    {/* Thumbnail */}
                    {isSkeleton ? (
                      <Skeleton
                        variant="rectangular"
                        height={200}
                        sx={{ borderRadius: 3, mb: 2 }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src={
                          course.thumbnail_url?.trim()
                            ? course.thumbnail_url
                            : "/images/no_image.jpg"
                        }
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
                    )}

                    {/* Title */}
                    {isSkeleton ? (
                      <>
                        <Skeleton height={28} sx={{ mb: 1 }} />
                        <Skeleton height={28} width="80%" sx={{ mb: 2 }} />
                      </>
                    ) : (
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.125rem",
                          mb: 1.5,
                          color: "#1a1a1a",
                          textAlign: "justify",
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                          lineHeight: 1.5,
                          minHeight: "3em",
                        }}
                      >
                        {course.title}
                      </Typography>
                    )}

                    {/* Instructor */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {isSkeleton ? (
                        <>
                          <Skeleton
                            variant="circular"
                            width={34}
                            height={34}
                            sx={{ mr: 1 }}
                          />
                          <Skeleton width="40%" />
                        </>
                      ) : (
                        <>
                          <Avatar
                            src={course.user?.avatar_url?.trim() || undefined}
                            alt={course.user?.name ?? ""}
                            sx={{
                              bgcolor: "#151312",
                              width: 32,
                              height: 32,
                              mr: 1,
                            }}
                          ></Avatar>
                          <Typography
                            sx={{
                              fontWeight: 500,
                              fontSize: "0.9375rem",
                              color: "#333",
                            }}
                          >
                            {course.user?.name}
                          </Typography>
                        </>
                      )}
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Progress */}
                    {isSkeleton ? (
                      <Skeleton
                        variant="rectangular"
                        height={7}
                        sx={{ borderRadius: 4 }}
                      />
                    ) : (
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
                            width: `${course.progress ?? 0}%`,
                            height: "100%",
                            background: "#FFD600",
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            },
          )}
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

  const RecommendedCourseList = ({ loading }: { loading: boolean }) => {
    const skeletonArray = Array.from({ length: 4 });

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
          {(loading || !recommendationCourse
            ? skeletonArray
            : recommendationCourse
          ).map((item: any, index: number) => {
            const isSkeleton = loading || !recommendationCourse;

            return (
              <Grid
                key={isSkeleton ? index : item.id}
                size={{ xs: 4, sm: 4, md: 3 }}
              >
                <Box
                  component={isSkeleton ? "div" : "button"}
                  onClick={
                    isSkeleton
                      ? undefined
                      : () => router.push(`/course/${item.id}`)
                  }
                  sx={{
                    borderRadius: 4,
                    boxShadow: isSkeleton
                      ? "0 2px 12px rgba(0,0,0,0.1)"
                      : "0 2px 12px rgba(0,0,0,0.3)",
                    bgcolor: "#fff",
                    p: 2.5,
                    display: "flex",
                    width: "100%",
                    flexDirection: "column",
                    height: "100%",
                    border: "none",
                    textAlign: "left",
                    transition: "all 0.3s ease",
                    ...(isSkeleton
                      ? {}
                      : {
                          "&:hover": {
                            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                            transform: "translateY(-4px)",
                            cursor: "pointer",
                          },
                        }),
                  }}
                >
                  {/* Thumbnail */}
                  {isSkeleton ? (
                    <Skeleton
                      variant="rectangular"
                      height={200}
                      sx={{ borderRadius: 3, mb: 2 }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={
                        item.thumbnail_url?.trim()
                          ? item.thumbnail_url
                          : "/images/no_image.jpg"
                      }
                      alt={item.title}
                      sx={{
                        borderRadius: 3,
                        width: "100%",
                        height: 200,
                        objectFit: "cover",
                        mb: 2,
                      }}
                    />
                  )}

                  {/* Category + Duration */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1.5,
                    }}
                  >
                    {isSkeleton ? (
                      <>
                        <Skeleton width="30%" height={20} />
                        <Skeleton width="20%" height={20} />
                      </>
                    ) : (
                      <>
                        <Typography
                          fontSize="0.875rem"
                          color="#999"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <StarIcon sx={{ fontSize: 23, color: "#f5c518" }} />
                          {item.rating ?? 0}
                        </Typography>
                        <Typography fontSize="0.875rem" color="#999">
                          {item.duration}
                        </Typography>
                      </>
                    )}
                  </Box>

                  {/* Title */}
                  {isSkeleton ? (
                    <>
                      <Skeleton height={28} />
                      <Skeleton width="80%" height={28} sx={{ mb: 1.5 }} />
                    </>
                  ) : (
                    <Typography
                      fontWeight={600}
                      fontSize="1.125rem"
                      textAlign="justify"
                      sx={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                      }}
                      overflow="hidden"
                      mb={1.5}
                    >
                      {item.title}
                    </Typography>
                  )}

                  {/* Description */}
                  {isSkeleton ? (
                    <>
                      <Skeleton height={18} />
                      <Skeleton height={18} />
                      <Skeleton width="70%" height={18} sx={{ mb: 2 }} />
                    </>
                  ) : (
                    <Typography
                      fontSize="0.875rem"
                      color="#666"
                      mb={2}
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      textAlign="justify"
                    >
                      {item.short_description}
                    </Typography>
                  )}

                  <Box sx={{ flexGrow: 1 }} />

                  {/* Footer */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pt: 2,
                      borderTop: "1px solid #f0f0f0",
                    }}
                  >
                    {isSkeleton ? (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Skeleton
                            variant="circular"
                            width={32}
                            height={32}
                            sx={{ mr: 1 }}
                          />
                          <Skeleton width={80} height={20} />
                        </Box>
                        <Skeleton width={60} height={28} />
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={item.user?.avatar_url?.trim() || undefined}
                            alt={item.user?.name ?? ""}
                            sx={{
                              bgcolor: "#151312",
                              width: 32,
                              height: 32,
                              mr: 1,
                            }}
                          ></Avatar>
                          <Typography
                            fontSize="0.875rem"
                            overflow="hidden"
                            textAlign="justify"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {item.user?.name ?? ""}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.125rem",
                            color: "#FFD600",
                          }}
                        >
                          {item.price === 0
                            ? `0 ${item.currency}`
                            : `${item.price.toLocaleString()}`}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <ReLearningCourseList loading={loading} />
      <CourseCategories />
      <RecommendedCourseList loading={loading} />
    </Box>
  );
}
