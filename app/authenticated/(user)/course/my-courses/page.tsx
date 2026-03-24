"use client";

import api from "@/api/api";
import CoursesWithGeneralInfo, {
  RecommendedCourse,
} from "@/components/CoursesWithGeneralInfo";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Box,
  Pagination,
  PaginationItem,
  Typography,
  Skeleton,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
  currentPage: number;
}

// Response shape:
// {
//   success: boolean,
//   data: {
//     data: RecommendedCourse[],
//     meta: PaginationMeta
//   }
// }

// ─── Styled Components ───────────────────────────────────────────────────────

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  paddingBottom: theme.spacing(8),
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(5, 4, 3),
  maxWidth: 1280,
  margin: "0 auto",
  borderBottom: `1px solid ${theme.palette.divider}`,
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

const ITEMS_PER_PAGE = 4;

const DEFAULT_META: PaginationMeta = {
  totalItems: 0,
  totalPages: 1,
  itemsPerPage: ITEMS_PER_PAGE,
  currentPage: 1,
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const response = await api.get(
        `/courses/course/me/enrolled?offset=${offset}&limit=${ITEMS_PER_PAGE}`,
      );

      // Response shape: { success, data: { data: Course[], meta: PaginationMeta } }
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
        <Typography
          variant="h4"
          fontWeight={700}
          letterSpacing="-0.5px"
          gutterBottom
        >
          My Courses
        </Typography>

        {loading ? (
          <Skeleton width={180} height={22} />
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            fontFamily="'DM Sans', sans-serif"
          >
            {meta.totalItems} courses &middot; Page {meta.currentPage}/
            {meta.totalPages}
          </Typography>
        )}
      </HeaderSection>

      {/* ── Course Grid ── */}
      <ContentSection>
        <CoursesWithGeneralInfo
          loading={loading}
          courses={courses}
          showPrice={false}
        />
      </ContentSection>

      {/* ── Pagination ── */}
      {!loading && meta.totalPages > 1 && (
        <PaginationWrapper>
          <Pagination
            count={meta.totalPages}
            page={meta.currentPage}
            onChange={handlePageChange}
            siblingCount={1}
            boundaryCount={1}
            renderItem={(item) => <PaginationItem {...item} />}
            showFirstButton
            showLastButton
            sx={{
              mt: 2,
              "& .MuiPaginationItem-root": {
                color: "#FFD600", // màu chữ vàng
                border: "1px solid #FFD600",
              },
              "& .MuiPaginationItem-root:hover": {
                backgroundColor: "rgba(255, 214, 0, 0.1)",
              },
              "& .Mui-selected": {
                backgroundColor: "#FFD600 !important",
                color: "#000",
                border: "none",
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.disabled"
            fontFamily="'DM Sans', sans-serif"
          >
            Showing {rangeStart}-{rangeEnd} of {meta.totalItems} courses
          </Typography>
        </PaginationWrapper>
      )}

      {/* ── Pagination skeleton khi đang load ── */}
      {loading && (
        <Stack alignItems="center" pt={6}>
          <Skeleton width={320} height={40} sx={{ borderRadius: 2 }} />
        </Stack>
      )}
    </PageWrapper>
  );
}
