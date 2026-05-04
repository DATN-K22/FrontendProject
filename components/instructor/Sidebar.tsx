'use client'
import React, { useState } from 'react'
import { Box, Typography, Avatar, InputBase, List, ListItem, Divider, Tooltip, IconButton } from '@mui/material'
import {
  Search,
  Home,
  BarChart2,
  Bell,
  Settings,
  LogOut,
  BookOpen,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─── Constants ────────────────────────────────────────────────────────────────
export const ICON_RAIL_W = 56
export const NAV_W = 220
const BTN_SIZE = 22
const TRANS = 'width 0.28s cubic-bezier(.4,0,.2,1)'

const BASE = '/authenticated/instructor'

const mainNav = [
  { label: 'Overview', href: `${BASE}/overview`, icon: <Home size={18} /> },
  { label: 'Courses', href: '/authenticated/course/my-courses', icon: <BarChart2 size={18} /> },
  { label: 'Learners', href: `${BASE}/learners`, icon: <BookOpen size={18} /> },
  { label: 'Forum / Q&A', href: `${BASE}/forum`, icon: <MessageSquare size={18} /> },
  { label: 'Calendar', href: `${BASE}/calendar`, icon: <Calendar size={18} /> }
]

const bottomNav = [
  { label: 'Notifications', href: `${BASE}/notifications`, icon: <Bell size={18} /> },
  { label: 'Settings', href: `${BASE}/settings`, icon: <Settings size={18} /> },
  { label: 'Logout', href: `/logout`, icon: <LogOut size={18} /> }
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function InstructorSidebar() {
  const [navOpen, setNavOpen] = useState(true)
  const pathname = usePathname()

  return (
    <>
      {/* Fixed sidebar */}
      <Box
        sx={{
          width: navOpen ? NAV_W : ICON_RAIL_W,
          transition: TRANS,
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 200,
          backgroundColor: '#f8fafc',
          borderRight: '1.5px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          py: 2,
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        {/* ── User ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, mb: 2.5, minWidth: 0 }}>
          <Tooltip title={navOpen ? '' : 'Tuan'} placement='right' arrow>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: '#111827',
                fontSize: '0.85rem',
                fontWeight: 700,
                flexShrink: 0,
                cursor: 'default'
              }}
            >
              T
            </Avatar>
          </Tooltip>
          <Box
            sx={{
              overflow: 'hidden',
              opacity: navOpen ? 1 : 0,
              transition: 'opacity 0.2s',
              whiteSpace: 'nowrap',
              minWidth: 0
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', lineHeight: 1.2 }}>
              Tuan
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>tuan@gmail.com</Typography>
          </Box>
        </Box>

        {/* ── Search ── */}
        <Box sx={{ px: 1.5, mb: 3 }}>
          {navOpen ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: '#fff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '10px',
                px: 1.5,
                py: 0.8
              }}
            >
              <Search size={14} color='#94a3b8' style={{ flexShrink: 0 }} />
              <InputBase
                placeholder='Search...'
                sx={{ fontSize: '0.8rem', color: '#475569', flex: 1, '& input': { p: 0 } }}
              />
            </Box>
          ) : (
            <Tooltip title='Search' placement='right' arrow>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  py: 0.8,
                  '&:hover': { color: '#111827' }
                }}
              >
                <Search size={18} />
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* ── Main nav ── */}
        <List dense disablePadding sx={{ flex: 1, px: 1 }}>
          {mainNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={navOpen ? '' : item.label} placement='right' arrow>
                  <Box
                    component={Link}
                    href={item.href}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 1,
                      py: 1.1,
                      width: '100%',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      backgroundColor: active ? '#fff' : 'transparent',
                      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.07)' : 'none',
                      justifyContent: navOpen ? 'flex-start' : 'center',
                      '&:hover': { backgroundColor: active ? '#fff' : '#f1f5f9' },
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <Box
                      sx={{
                        color: active ? '#111827' : '#94a3b8',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box
                      sx={{
                        overflow: 'hidden',
                        opacity: navOpen ? 1 : 0,
                        transition: 'opacity 0.15s',
                        whiteSpace: 'nowrap',
                        minWidth: 0
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: active ? 700 : 500,
                          color: active ? '#111827' : '#64748b'
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              </ListItem>
            )
          })}
        </List>

        {/* ── Bottom nav ── */}
        <Box sx={{ px: 1 }}>
          <Divider sx={{ mb: 1.5, borderColor: '#e2e8f0' }} />
          <List dense disablePadding>
            {bottomNav.map((item) => {
              const active = pathname === item.href
              return (
                <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                  <Tooltip title={navOpen ? '' : item.label} placement='right' arrow>
                    <Box
                      component={Link}
                      href={item.href}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1,
                        py: 1,
                        width: '100%',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        justifyContent: navOpen ? 'flex-start' : 'center',
                        backgroundColor: active ? '#fff' : 'transparent',
                        '&:hover': { backgroundColor: '#f1f5f9' },
                        transition: 'background-color 0.15s'
                      }}
                    >
                      <Box sx={{ color: '#94a3b8', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        {item.icon}
                      </Box>
                      <Box
                        sx={{
                          overflow: 'hidden',
                          opacity: navOpen ? 1 : 0,
                          transition: 'opacity 0.15s',
                          whiteSpace: 'nowrap',
                          minWidth: 0
                        }}
                      >
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>
                          {item.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                </ListItem>
              )
            })}
          </List>
        </Box>

        {/* ── Toggle button ── */}
        <Tooltip title={navOpen ? 'Ẩn menu' : 'Hiện menu'} placement='right' arrow>
          <IconButton
            onClick={() => setNavOpen((v) => !v)}
            size='small'
            sx={{
              position: 'absolute',
              right: -(BTN_SIZE / 2) - 1,
              top: '50%',
              transform: 'translateY(-50%)',
              width: BTN_SIZE,
              height: BTN_SIZE,
              p: 0,
              backgroundColor: '#fff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '50%',
              color: '#64748b',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              zIndex: 300,
              '&:hover': { backgroundColor: '#f1f5f9', color: '#111827' }
            }}
          >
            {navOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Spacer — pushes content, transitions in sync with sidebar */}
      <Box
        sx={{
          width: navOpen ? NAV_W : ICON_RAIL_W,
          flexShrink: 0,
          transition: TRANS
        }}
      />
    </>
  )
}
