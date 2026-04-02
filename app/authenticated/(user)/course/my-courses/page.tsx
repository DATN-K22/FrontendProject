"use client";

import api from "@/api/api";
import CoursesWithGeneralInfo, {
  RecommendedCourse,
} from "@/components/coursesWithGeneralInfo";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Box,
  Pagination,
  PaginationItem,
  Typography,
  Skeleton,
  Stack,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { authUtils } from "@/utils/auth";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
  currentPage: number;
}

// ─── Styled Components ───────────────────────────────────────────────────────

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: "#FAF9F4", // nền sáng
  paddingBottom: theme.spacing(8),
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(5, 4, 3),
  maxWidth: 1280,
  margin: "0 auto",
  borderBottom: "1px solid #E5E7EB",
  marginBottom: theme.spacing(4),
}));

const ContentSection = styled(Box)(() => ({
  maxWidth: 1280,
  margin: "0 auto",
  padding: "0 32px",
}));

const PaginationWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1.5),
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(2),
}));

const ITEMS_PER_PAGE = 12;

const DEFAULT_META: PaginationMeta = {
  totalItems: 0,
  totalPages: 1,
  itemsPerPage: ITEMS_PER_PAGE,
  currentPage: 1,
};

// ─── Empty State ─────────────────────────────────────────────────────────────

const EmptyState = () => (
  <Box
    sx={{
      width: 260,
      height: 260,
      margin: "80px auto 0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",

      borderRadius: "50%",
      bgcolor: "#FFF9CC",

      textAlign: "center",
      px: 3,

      boxShadow: "0 12px 40px #FFF9CC",
    }}
  >
    {/* Icon */}
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 1,
      }}
    >
      <SchoolOutlinedIcon sx={{ fontSize: 28, color: "#C0C4CC" }} />
    </Box>

    {/* Title */}
    <Typography
      variant="body2"
      fontWeight={500}
      color="#6B7280"
      sx={{ mb: 0.5 }}
    >
      No courses yet
    </Typography>

    {/* Description */}
    <Typography
      variant="caption"
      color="#9CA3AF"
      sx={{
        maxWidth: 180,
        lineHeight: 1.4,
      }}
    >
      You haven't enrolled in any courses
    </Typography>
  </Box>
);

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const { userData } = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;

      const response = await api.get(
        `/courses/course/me/${userData.id}/enrolled?offset=${offset}&limit=${ITEMS_PER_PAGE}`,
      );

      const { data: courseList, meta: responseMeta } = response.data.data;

      setCourses(courseList ?? []);
      setMeta(responseMeta ?? DEFAULT_META);
    } catch (error) {
      console.error(error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, fetchData]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const rangeStart = (meta.currentPage - 1) * meta.itemsPerPage + 1;
  const rangeEnd = Math.min(
    meta.currentPage * meta.itemsPerPage,
    meta.totalItems,
  );

  return (
    <PageWrapper>
      <HeaderSection>
        <Typography variant="h4" fontWeight={700} gutterBottom color="#111827">
          My Courses
        </Typography>

        {loading ? (
          <Skeleton width={180} height={22} />
        ) : (
          <Typography variant="body2" color="#6B7280">
            {meta.totalItems} courses · Page {meta.totalItems == 0 ? 0 : meta.currentPage}/
            {meta.totalPages}
          </Typography>
        )}
      </HeaderSection>

      {/* ── Content ── */}
      <ContentSection>
        {!loading && courses.length === 0 ? (
          <EmptyState />
        ) : (
          <CoursesWithGeneralInfo
            loading={loading}
            courses={courses}
            showPrice={false}
          />
        )}
      </ContentSection>

      {/* ── Pagination ── */}
      {!loading && meta.totalPages > 1 && (
        <PaginationWrapper>
          <Pagination
            count={meta.totalPages}
            page={meta.currentPage}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
            sx={{
              mt: 2,
              "& .MuiPaginationItem-root": {
                color: "#374151",
                border: "1px solid #E5E7EB",
              },
              "& .MuiPaginationItem-root:hover": {
                backgroundColor: "#F3F4F6",
              },
              "& .Mui-selected": {
                backgroundColor: "#FFD600 !important",
                color: "#000",
                border: "none",
              },
            }}
          />

          <Typography variant="caption" color="#9CA3AF">
            Showing {rangeStart}-{rangeEnd} of {meta.totalItems} courses
          </Typography>
        </PaginationWrapper>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <Stack alignItems="center" pt={6}>
          <Skeleton width={320} height={40} sx={{ borderRadius: 2 }} />
        </Stack>
      )}
    </PageWrapper>
  );
}
