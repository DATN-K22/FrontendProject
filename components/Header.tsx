'use client'
import {
  Box,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Button,
  InputBase,
  Modal,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Popover,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  Radio,
  RadioGroup,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  CircularProgress,
  Tooltip
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import SettingsIcon from '@mui/icons-material/Settings'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { usePathname, useRouter } from 'next/navigation'
import { authUtils } from '@/utils/auth'
import { useEffect, useState, useRef } from 'react'
import { courseApi, FilterOptionDto, SearchCourseResponseDto } from '@/api/courses/search'
import { useDebounce } from '@/hooks/useDebounce'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [userData, setUserData] = useState<null | ReturnType<typeof authUtils.getAuth>['userData']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isSticky, setIsSticky] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  // Search states
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null)
  const [filters, setFilters] = useState<FilterOptionDto>({
    q: '',
    levels: [],
    isPaid: undefined,
    minPrice: 0,
    maxPrice: 500
  })
  const [searchResults, setSearchResults] = useState<SearchCourseResponseDto | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const debouncedFilters = useDebounce(filters, 500)

  useEffect(() => {
    const { userData } = authUtils.getAuth()
    setUserData(userData)
    setIsLoading(false)
  }, [])

  // Handle scroll event - fix header khi scroll qua kích thước của nó
  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return

      const currentScrollY = window.scrollY

      if (currentScrollY > 2) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!searchAnchorEl && !filters.q) return

    const fetchSearch = async () => {
      setIsSearching(true)
      try {
        const data = await courseApi.searchCourses(debouncedFilters)
        setSearchResults(data)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }
    fetchSearch()
  }, [debouncedFilters, searchAnchorEl])

  const open = Boolean(anchorEl)
  const menus = [
    { label: 'Home', path: '/authenticated', isTeacher: false },
    {
      label: 'My course',
      path: '/authenticated/course/my-courses',
      isTeacher: false
    },
    { label: 'Calendar', path: '/authenticated/schedule', isTeacher: false },
    { label: 'Lab configuration', path: 'https://d1rj9bz6vwjklr.cloudfront.net/', isTeacher: true }
  ]

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSearchFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setSearchAnchorEl(e.currentTarget)
  }

  return (
    <Box
      ref={headerRef}
      component='header'
      sx={{
        color: '#000000',

        px: { xs: 2, md: 6 },

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',

        position: isSticky ? 'fixed' : 'static',

        top: isSticky ? 0 : 'auto',
        left: isSticky ? 0 : 'auto',
        right: isSticky ? 0 : 'auto',

        backgroundColor: '#ffffff',

        zIndex: 100,

        borderBottomLeftRadius: '24px',

        borderBottomRightRadius: '24px',

        boxShadow: isSticky ? '0 20px 50px rgba(0,0,0,0.3)' : 'none',

        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Stack direction='row' alignItems='center' spacing={1}>
        <Button
          sx={{
            padding: '0.5em',
            borderRadius: '2em',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => router.replace('/')}
        >
          <Box
            component='img'
            src='/images/webLogo.png'
            alt='Web logo'
            fetchPriority='high'
            sx={{
              height: 'auto',
              width: isSticky ? '80%' : '70%',
              objectFit: 'contain',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </Button>

        <Box
          sx={{
            ml: { xs: 0, md: 3 },
            bgcolor: '#E6E6E6',
            borderRadius: { xs: 1, md: 2 },
            px: { xs: 1.5, md: 2.5 },
            py: isSticky ? 0.7 : { xs: 0.5, md: 0.7 },
            display: 'flex',
            alignItems: 'center',
            width: isSticky ? { xs: 140, sm: 220, md: 320 } : { xs: 120, sm: 180, md: 280 },
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <SearchIcon sx={{ color: '#000', mr: 1 }} />
          <InputBase
            placeholder='Search for courses'
            inputProps={{ 'aria-label': 'search' }}
            value={filters.q}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, q: e.target.value }))
              if (!searchAnchorEl) setSearchAnchorEl(e.currentTarget)
            }}
            onFocus={handleSearchFocus}
            sx={{
              fontSize: { xs: '0.875rem', md: '1rem' },
              color: '#000',
              width: '100%'
            }}
          />
        </Box>

        {/* Search & Filters Popover */}
        <Popover
          open={Boolean(searchAnchorEl)}
          anchorEl={searchAnchorEl}
          onClose={() => setSearchAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          disableAutoFocus
          disableEnforceFocus
          PaperProps={{
            sx: {
              mt: 1,
              width: { xs: '90vw', md: 700 },
              maxHeight: 500,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              borderRadius: 2
            }
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: 250 },
              p: 2,
              borderRight: { md: '1px solid #eee' },
              borderBottom: { xs: '1px solid #eee', md: 'none' },
              overflowY: 'auto',
              flexShrink: 0
            }}
          >
            <Typography variant='subtitle1' fontWeight={600} mb={1}>
              Bộ lọc
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Typography variant='subtitle2' fontWeight={600} mb={1}>
              Giá
            </Typography>
            <RadioGroup
              value={filters.isPaid === undefined ? 'all' : filters.isPaid ? 'paid' : 'free'}
              onChange={(e) => {
                const val = e.target.value
                setFilters((prev) => ({
                  ...prev,
                  isPaid: val === 'all' ? undefined : val === 'paid'
                }))
              }}
            >
              <FormControlLabel value='all' control={<Radio size='small' />} label='Tất cả' />
              <FormControlLabel
                value='paid'
                control={<Radio size='small' />}
                label={`Trả phí ${searchResults?.facets?.priceTypes?.PAID !== undefined ? `(${searchResults.facets.priceTypes.PAID})` : ''}`}
              />
              <FormControlLabel
                value='free'
                control={<Radio size='small' />}
                label={`Miễn phí ${searchResults?.facets?.priceTypes?.FREE !== undefined ? `(${searchResults.facets.priceTypes.FREE})` : ''}`}
              />
            </RadioGroup>

            <Box sx={{ px: 1, mt: 2, mb: 2 }}>
              <Slider
                value={[filters.minPrice ?? 0, filters.maxPrice ?? 500]}
                onChange={(e, val) => {
                  if (Array.isArray(val)) {
                    setFilters((prev) => ({ ...prev, minPrice: val[0], maxPrice: val[1] }))
                  }
                }}
                min={0}
                max={500}
                step={0.01}
                valueLabelDisplay='auto'
                valueLabelFormat={(val) => `${val.toFixed(2)}đ`}
                size='small'
              />
              <Typography variant='caption' color='text.secondary'>
                {(filters.minPrice ?? 0).toFixed(2)}đ - {(filters.maxPrice ?? 500).toFixed(2)}đ
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant='subtitle2' fontWeight={600} mb={1}>
              Trình độ
            </Typography>
            <FormGroup>
              {[
                { value: 'Beginner', label: 'Cơ bản' },
                { value: 'Intermediate', label: 'Trung cấp' },
                { value: 'Advanced', label: 'Nâng cao' }
              ].map((level) => {
                const count = searchResults?.facets?.levels?.[level.value] || 0
                return (
                  <FormControlLabel
                    key={level.value}
                    control={
                      <Checkbox
                        size='small'
                        checked={filters.levels?.includes(level.value)}
                        onChange={(e) => {
                          setFilters((prev) => {
                            const newLevels = e.target.checked
                              ? [...(prev.levels || []), level.value]
                              : (prev.levels || []).filter((l) => l !== level.value)
                            return { ...prev, levels: newLevels }
                          })
                        }}
                      />
                    }
                    label={`${level.label} (${count})`}
                  />
                )
              })}
            </FormGroup>
          </Box>

          <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
            {isSearching && (!searchResults || searchResults.data.length === 0) ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : searchResults?.data?.length === 0 ? (
              <Typography color='text.secondary' textAlign='center' mt={4}>
                Không tìm thấy kết quả nào
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {searchResults?.data?.map((course) => (
                  <ListItem
                    key={course.id}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f5f5f5' },
                      borderRadius: 1,
                      mb: 1,
                      px: 1,
                      alignItems: 'flex-start'
                    }}
                    onClick={() => {
                      setSearchAnchorEl(null)
                      router.push(`/authenticated/course/${course.id}`)
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant='rounded'
                        src={course.thumbnail_url || ''}
                        sx={{ width: 100, height: 60, mr: 2 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant='subtitle2' fontWeight={600} noWrap title={course.title}>
                          {course.title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          component='span'
                          sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}
                        >
                          <span>
                            {course.user?.name || 'Instructor'} •{' '}
                            {course.course_level === 'Beginner'
                              ? 'Cơ bản'
                              : course.course_level === 'Intermediate'
                                ? 'Trung cấp'
                                : course.course_level === 'Advanced'
                                  ? 'Nâng cao'
                                  : course.course_level}
                          </span>
                          <span style={{ fontWeight: 600, color: '#d32f2f', marginTop: '2px' }}>
                            {Number(course.price) === 0 ? 'Miễn phí' : `${Number(course.price).toLocaleString()}đ`}
                          </span>
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Popover>
      </Stack>

      {userData && (
        <Stack direction='row' spacing={5} alignItems='center' sx={{ display: { xs: 'none', md: 'flex' } }}>
          {menus.map((item) => {
            const isActive = pathname === item.path
            if (item.isTeacher && !(userData.role === 'teacher')) return null
            return (
              <Typography
                key={item.path}
                onClick={() => {
                  if (!item.isTeacher) router.push(item.path)
                  else window.open(`https://d1rj9bz6vwjklr.cloudfront.net/`)
                }}
                sx={{
                  cursor: 'pointer',
                  color: isActive ? '#000' : '#5B5B5B',
                  fontWeight: isActive ? 600 : 400,
                  position: 'relative',
                  '&::after': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        bottom: -4,
                        left: 0,
                        width: '100%',
                        height: '2px',
                        backgroundColor: '#000'
                      }
                    : {},
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
              >
                {item.label}
              </Typography>
            )
          })}
        </Stack>
      )}

      {/* Right: Profile */}
      {isLoading ? (
        <Box sx={{ width: 120 }} />
      ) : userData ? (
        <Stack direction='row' spacing={2} alignItems='center'>
          <Box
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',

              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.05)'
              }
            }}
          >
            <Avatar sx={{ bgcolor: '#151312', width: 30, height: 30 }} />
            <Typography>{userData?.first_name || 'User'}</Typography>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left'
            }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 200
              }
            }}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <AccountCircleIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText
                onClick={() => {
                  router.push(`/authenticated/${userData.id}/profile`)
                }}
              >
                Account
              </ListItemText>
            </MenuItem>

            <MenuItem
              onClick={async () => {
                await authUtils.clearAuth()
                handleClose()
                window.location.href = '/'
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      ) : (
        <Stack direction='row' spacing={2} alignItems='center'>
          <Button
            onClick={() => router.push('/auth/register')}
            variant='contained'
            sx={{
              backgroundColor: '#fffacb',
              color: '#000',
              borderRadius: { xs: 4, md: 8 },
              py: { xs: 1, md: 1.25 },
              px: { xs: 2, md: 3 },
              minWidth: { xs: 90, md: 120 },
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.875rem', md: '1rem' },
              '&:hover': {
                backgroundColor: '#f6e29b'
              }
            }}
          >
            Register
          </Button>
          <Button
            variant='contained'
            onClick={() => router.push('/auth/login')}
            sx={{
              backgroundColor: '#FFD700',
              color: '#000',
              borderRadius: { xs: 4, md: 8 },
              py: { xs: 1, md: 1.25 },
              px: { xs: 2, md: 3 },
              minWidth: { xs: 90, md: 120 },
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.875rem', md: '1rem' },
              '&:hover': {
                backgroundColor: '#FFC700'
              }
            }}
          >
            Login
          </Button>
        </Stack>
      )}
    </Box>
  )
}
