"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  InputBase,
  Grid,
  List,
  ListItem,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Home,
  BarChart2,
  Bell,
  Settings,
  LogOut,
  MoreHorizontal,
  Plus,
  BookOpen,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Course = {
  id: number;
  title: string;
  badge: "Free" | "Paid" | "Premium";
  price: number;
  chapters: number;
  orders: number;
  certificates: number;
  reviews: number;
  addedToShelf: number;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockCourses: Course[] = [
  { id: 1, title: "Beginner's Guide to Design",  badge: "Free",    price: 50,  chapters: 13, orders: 254, certificates: 25, reviews: 25, addedToShelf: 500 },
  { id: 2, title: "Beginner's Guide to Design",  badge: "Free",    price: 50,  chapters: 13, orders: 254, certificates: 25, reviews: 25, addedToShelf: 500 },
  { id: 3, title: "Beginner's Guide to Design",  badge: "Free",    price: 50,  chapters: 13, orders: 254, certificates: 25, reviews: 25, addedToShelf: 500 },
  { id: 4, title: "Advanced UI/UX Patterns",     badge: "Paid",    price: 99,  chapters: 20, orders: 130, certificates: 40, reviews: 60, addedToShelf: 320 },
  { id: 5, title: "Mastering Figma",             badge: "Premium", price: 149, chapters: 30, orders: 89,  certificates: 12, reviews: 18, addedToShelf: 210 },
  { id: 6, title: "Design Systems at Scale",     badge: "Paid",    price: 79,  chapters: 16, orders: 200, certificates: 33, reviews: 44, addedToShelf: 400 },
];

// ─── Nav items ────────────────────────────────────────────────────────────────
const mainNav = [
  { label: "Overview",    icon: <Home size={18} /> },
  { label: "Courses",     icon: <BarChart2 size={18} />, active: true },
  { label: "Learners",    icon: <BookOpen size={18} /> },
  { label: "Forum / Q&A", icon: <MessageSquare size={18} /> },
  { label: "Calendar",    icon: <Calendar size={18} /> },
];
const bottomNav = [
  { label: "Notifications", icon: <Bell size={18} /> },
  { label: "Logout",        icon: <LogOut size={18} /> },
  { label: "Settings",      icon: <Settings size={18} /> },
];

// ─── Badge colours ────────────────────────────────────────────────────────────
const badgeStyle: Record<Course["badge"], { bg: string; color: string }> = {
  Free:    { bg: "#f1f5f9", color: "#475569" },
  Paid:    { bg: "#eff6ff", color: "#2563eb" },
  Premium: { bg: "#fdf4ff", color: "#9333ea" },
};

// ─── Dimensions ───────────────────────────────────────────────────────────────
const ICON_W   = 72;
const NAV_W    = 220;
const BTN_SIZE = 22;   // toggle button diameter

// ─── CourseCard ───────────────────────────────────────────────────────────────
function CourseCard({ course }: { course: Course }) {
  const b = badgeStyle[course.badge];
  const stats = [
    { value: `$${course.price.toFixed(2)}`, label: "Price" },
    { value: course.chapters,     label: "Chapters" },
    { value: course.orders,       label: "Orders" },
    { value: course.certificates, label: "Certificates" },
    { value: course.reviews,      label: "Reviews" },
    { value: course.addedToShelf, label: "Added to Shelf" },
  ];
  return (
    <Box sx={{
      border: "1.5px solid #e8edf2", borderRadius: "14px", p: "20px 22px",
      backgroundColor: "#fff", cursor: "pointer",
      transition: "box-shadow 0.2s, transform 0.2s",
      "&:hover": { boxShadow: "0 8px 28px rgba(0,0,0,0.09)", transform: "translateY(-2px)" },
    }}>
      <Box sx={{
        display: "inline-block", px: 1.5, py: 0.4, borderRadius: "8px", mb: 1.5,
        fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em",
        backgroundColor: b.bg, color: b.color, border: `1px solid ${b.color}22`,
      }}>
        {course.badge}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", mb: 2, lineHeight: 1.35 }}>
        {course.title}
      </Typography>
      <Grid container columns={3} rowSpacing={1.5}>
        {stats.map((s) => (
          <Grid key={s.label} size={1}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>{s.value}</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.2 }}>{s.label}</Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// ─── Toggle button ────────────────────────────────────────────────────────────
function ToggleBtn({
  open, onClick, tooltip, sx = {},
}: {
  open: boolean;
  onClick: () => void;
  tooltip: string;
  sx?: object;
}) {
  return (
    <Tooltip title={tooltip} placement="right" arrow>
      <IconButton
        onClick={onClick}
        size="small"
        sx={{
          width: BTN_SIZE, height: BTN_SIZE, p: 0,
          backgroundColor: "#fff",
          border: "1.5px solid #e2e8f0",
          borderRadius: "50%",
          color: "#64748b",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          zIndex: 300,
          "&:hover": { backgroundColor: "#f1f5f9", color: "#111827" },
          ...sx,
        }}
      >
        {open ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
      </IconButton>
    </Tooltip>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({
  iconOpen, navOpen, onToggleIcon, onToggleNav,
}: {
  iconOpen: boolean;
  navOpen: boolean;
  onToggleIcon: () => void;
  onToggleNav: () => void;
}) {
  const TRANS = "width 0.28s cubic-bezier(.4,0,.2,1)";

  return (
    <Box sx={{ display: "flex", height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 200 }}>

      {/* ── Icon strip ─────────────────────────────────────────── */}
      <Box sx={{
        width: iconOpen ? ICON_W : 0,
        overflow: "hidden",
        transition: TRANS,
        backgroundColor: "#111827",
        display: "flex", flexDirection: "column", alignItems: "center",
        py: 2, gap: 1, flexShrink: 0,
      }}>
        {/* Logo */}
        <Box sx={{
          width: 40, height: 40, borderRadius: "10px", mb: 2, flexShrink: 0,
          backgroundColor: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BookOpen size={20} color="#60a5fa" />
        </Box>

        {mainNav.map((item) => (
          <Tooltip key={item.label} title={item.label} placement="right" arrow>
            <IconButton size="small" sx={{
              color: item.active ? "#60a5fa" : "#64748b",
              backgroundColor: item.active ? "#1e40af22" : "transparent",
              width: 38, height: 38, borderRadius: "8px", flexShrink: 0,
              "&:hover": { backgroundColor: "#1e293b", color: "#e2e8f0" },
            }}>
              {item.icon}
            </IconButton>
          </Tooltip>
        ))}

        <Box sx={{ flex: 1 }} />

        {bottomNav.map((item) => (
          <Tooltip key={item.label} title={item.label} placement="right" arrow>
            <IconButton size="small" sx={{
              color: "#64748b", width: 38, height: 38,
              borderRadius: "8px", flexShrink: 0,
              "&:hover": { backgroundColor: "#1e293b", color: "#e2e8f0" },
            }}>
              {item.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>

      {/* ── Toggle A: icon strip ────────────────────────────────── */}
      {/*   Floats on the right edge of the icon strip              */}
      <Box sx={{ position: "relative", width: 0, display: "flex", alignItems: "center" }}>
        <ToggleBtn
          open={iconOpen}
          onClick={onToggleIcon}
          tooltip={iconOpen ? "Ẩn thanh icon" : "Hiện thanh icon"}
          sx={{ position: "absolute", left: -BTN_SIZE / 2, top: "32px" }}
        />
      </Box>

      {/* ── Nav panel ──────────────────────────────────────────── */}
      <Box sx={{
        width: navOpen ? NAV_W : 0,
        overflow: "hidden",
        transition: TRANS,
        backgroundColor: "#f8fafc",
        borderRight: "1.5px solid #e2e8f0",
        display: "flex", flexDirection: "column",
        py: 2, flexShrink: 0,
        position: "relative",
      }}>
        {/* Inner wrapper keeps padding so content doesn't squish weirdly */}
        <Box sx={{ px: 1.5, display: "flex", flexDirection: "column", flex: 1, minWidth: NAV_W }}>
          {/* User */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1, mb: 2.5, whiteSpace: "nowrap" }}>
            <Avatar sx={{ width: 40, height: 40, backgroundColor: "#111827", fontSize: "0.85rem", fontWeight: 700, flexShrink: 0 }}>
              T
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#111827", lineHeight: 1.2 }}>Tuan</Typography>
              <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>tuan@gmail.com</Typography>
            </Box>
          </Box>

          {/* Search */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1,
            backgroundColor: "#fff", border: "1.5px solid #e2e8f0",
            borderRadius: "10px", px: 1.5, py: 0.8, mb: 3, whiteSpace: "nowrap",
          }}>
            <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            <InputBase placeholder="Search..." sx={{ fontSize: "0.8rem", color: "#475569", flex: 1, "& input": { p: 0 } }} />
          </Box>

          {/* Main nav */}
          <List dense disablePadding sx={{ flex: 1 }}>
            {mainNav.map((item) => (
              <ListItem key={item.label} disablePadding sx={{
                borderRadius: "10px", mb: 0.5,
                backgroundColor: item.active ? "#fff" : "transparent",
                boxShadow: item.active ? "0 1px 4px rgba(0,0,0,0.07)" : "none",
              }}>
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 1.5,
                  px: 1.5, py: 1.1, width: "100%", cursor: "pointer",
                  borderRadius: "10px", whiteSpace: "nowrap",
                  "&:hover": { backgroundColor: item.active ? "#fff" : "#f1f5f9" },
                }}>
                  <Box sx={{ color: item.active ? "#111827" : "#94a3b8", flexShrink: 0 }}>{item.icon}</Box>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: item.active ? 700 : 500, color: item.active ? "#111827" : "#64748b" }}>
                    {item.label}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>

          {/* Bottom nav */}
          <Box>
            <Divider sx={{ mb: 1.5, borderColor: "#e2e8f0" }} />
            <List dense disablePadding>
              {bottomNav.map((item) => (
                <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                  <Box sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    px: 1.5, py: 1, width: "100%", cursor: "pointer",
                    borderRadius: "10px", whiteSpace: "nowrap",
                    "&:hover": { backgroundColor: "#f1f5f9" },
                  }}>
                    <Box sx={{ color: "#94a3b8", flexShrink: 0 }}>{item.icon}</Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748b" }}>{item.label}</Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        {/* ── Toggle B: nav panel — centred on right edge ── */}
        <ToggleBtn
          open={navOpen}
          onClick={onToggleNav}
          tooltip={navOpen ? "Ẩn menu" : "Hiện menu"}
          sx={{
            position: "absolute",
            right: -BTN_SIZE / 2 - 1,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminCoursesPage() {
  const [iconOpen, setIconOpen] = useState(true);
  const [navOpen,  setNavOpen]  = useState(true);

  const sidebarW = (iconOpen ? ICON_W : 0) + (navOpen ? NAV_W : 0);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar
        iconOpen={iconOpen}
        navOpen={navOpen}
        onToggleIcon={() => setIconOpen((v) => !v)}
        onToggleNav={() => setNavOpen((v) => !v)}
      />

      {/* Main content */}
      <Box sx={{
        ml: `${sidebarW}px`,
        flex: 1,
        p: "28px 32px",
        minHeight: "100vh",
        transition: "margin-left 0.28s cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.6rem", color: "#111827", letterSpacing: "-0.02em" }}>
            Courses
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              sx={{
                backgroundColor: "#2563eb", color: "#fff",
                borderRadius: "10px", textTransform: "none",
                fontWeight: 700, fontSize: "0.875rem",
                px: 2.5, py: 1.1,
                boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
                "&:hover": { backgroundColor: "#1d4ed8" },
              }}
            >
              Add Course
            </Button>
            <IconButton sx={{
              border: "1.5px solid #e2e8f0", borderRadius: "10px",
              backgroundColor: "#fff", color: "#64748b",
              "&:hover": { backgroundColor: "#f1f5f9" },
            }}>
              <MoreHorizontal size={18} />
            </IconButton>
          </Box>
        </Box>

        {/* Grid */}
        <Grid container spacing={2.5}>
          {mockCourses.map((course) => (
            <Grid key={course.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}