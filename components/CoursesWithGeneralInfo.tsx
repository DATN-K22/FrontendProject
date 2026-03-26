import { Avatar, Box, Grid, Skeleton, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import StarIcon from "@mui/icons-material/Star";

export type RecommendedCourse = {
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

export enum CourseLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
  AllLevels = "All Levels",
}

export default function CoursesWithGeneralInfo({
  loading,
  courses,
  showPrice = true,
}: {
  loading: boolean;
  courses: any[] | null;
  showPrice?: boolean;
}) {
  const skeletonArray = Array.from({ length: 4 });
  const router = useRouter();
  return (
    <Box>
      {/* Course Grid */}
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        {(loading || !courses ? skeletonArray : courses).map(
          (item: any, index: number) => {
            const isSkeleton = loading || !courses;

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
                      : () => router.push(`/authenticated/course/${item.id}`)
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

                        {showPrice && (
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
                        )}
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
            );
          },
        )}
      </Grid>
    </Box>
  );
}
