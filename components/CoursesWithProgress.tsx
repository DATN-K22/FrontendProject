import { Avatar, Box, Grid, Skeleton, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export type RelearningCourse = {
  id: string;
  thumbnail_url: string;
  title: string;
  user: {
    name: string;
    avt_url: string;
  };
  progress: number;
};

export default function CoursesWithProgress({
  loading,
  reLearningCourse,
}: {
  loading: boolean;
  reLearningCourse: RelearningCourse[] | null;
}) {
  const skeletonArray = Array.from({ length: 3 });
  const isSkeleton = loading || !reLearningCourse;
  const router = useRouter();
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
          variant="h4"
          sx={{
            fontWeight: 600,
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
                      : () => router.push(`/authenticated/course/${course.id}`)
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
}
