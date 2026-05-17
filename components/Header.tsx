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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Search states
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null)
  const [filters, setFilters] = useState<FilterOptionDto>({
    q: '',
    levels: [],
    isPaid: undefined,
    minPrice: 0,
    maxPrice: 500,
  })
  const [searchResults, setSearchResults] = useState<SearchCourseResponseDto | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  
  const debouncedFilters = useDebounce(filters, 500)

  useEffect(() => {
    const { userData } = authUtils.getAuth()
    setUserData(userData)
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
    { label: 'Home', path: '/' },
    {
      label: 'My course',
      path: '/authenticated/course/my-courses'
    },
    { label: 'Calendar', path: '/authenticated/schedule' }
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
      component='header'
      sx={{
        color: '#000000',
        px: { xs: 2, md: 6 },
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Stack direction='row' alignItems='center' spacing={1}>
        <Button
          sx={{
            padding: '0.5em',
            borderRadius: '2em'
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
              width: '70%',
              objectFit: 'contain'
            }}
          />
        </Button>

        <Box
          sx={{
            ml: { xs: 0, md: 3 },
            bgcolor: '#E6E6E6',
            borderRadius: { xs: 1, md: 2 },
            px: { xs: 1.5, md: 2.5 },
            py: { xs: 0.5, md: 0.7 },
            display: 'flex',
            alignItems: 'center',
            width: { xs: 140, sm: 220, md: 320 }
          }}
        >
          <SearchIcon sx={{ color: '#000', mr: 1 }} />
          <InputBase
            placeholder='Search for courses'
            inputProps={{ 'aria-label': 'search' }}
            value={filters.q}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, q: e.target.value }))
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
          {/* Left Side: Filters */}
          <Box sx={{ width: { xs: '100%', md: 250 }, p: 2, borderRight: { md: '1px solid #eee' }, borderBottom: { xs: '1px solid #eee', md: 'none' }, overflowY: 'auto', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>Filters</Typography>
              <Tooltip title="Open in full page" arrow>
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setSearchAnchorEl(null)
                    const params = new URLSearchParams()
                    if (filters.q) params.set('q', filters.q)
                    if (filters.levels && filters.levels.length > 0) params.set('levels', filters.levels.join(','))
                    if (filters.isPaid !== undefined) params.set('isPaid', String(filters.isPaid))
                    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice))
                    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice))
                    router.push(`/search?${params.toString()}`)
                  }}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} mb={1}>Price</Typography>
            <RadioGroup
              value={filters.isPaid === undefined ? 'all' : filters.isPaid ? 'paid' : 'free'}
              onChange={(e) => {
                const val = e.target.value
                setFilters(prev => ({
                  ...prev,
                  isPaid: val === 'all' ? undefined : val === 'paid'
                }))
              }}
            >
              <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
              <FormControlLabel 
                value="paid" 
                control={<Radio size="small" />} 
                label={`Paid ${searchResults?.facets?.priceTypes?.PAID !== undefined ? `(${searchResults.facets.priceTypes.PAID})` : ''}`} 
              />
              <FormControlLabel 
                value="free" 
                control={<Radio size="small" />} 
                label={`Free ${searchResults?.facets?.priceTypes?.FREE !== undefined ? `(${searchResults.facets.priceTypes.FREE})` : ''}`} 
              />
            </RadioGroup>

            <Box sx={{ px: 1, mt: 2, mb: 2 }}>
               <Slider
                 value={[filters.minPrice ?? 0, filters.maxPrice ?? 500]}
                 onChange={(e, val) => {
                   if (Array.isArray(val)) {
                     setFilters(prev => ({ ...prev, minPrice: val[0], maxPrice: val[1] }))
                   }
                 }}
                 min={0}
                 max={500}
                 step={0.01}
                 valueLabelDisplay="auto"
                 valueLabelFormat={(val) => `$${val.toFixed(2)}`}
                 size="small"
               />
               <Typography variant="caption" color="text.secondary">
                 ${(filters.minPrice ?? 0).toFixed(2)} - ${(filters.maxPrice ?? 500).toFixed(2)}
               </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} mb={1}>Difficulty</Typography>
            <FormGroup>
               {[
                 { value: 'Beginner', label: 'Beginner' },
                 { value: 'Intermediate', label: 'Intermediate' },
                 { value: 'Advanced', label: 'Advanced' }
               ].map(level => {
                 const count = searchResults?.facets?.levels?.[level.value] || 0
                 return (
                   <FormControlLabel
                     key={level.value}
                     control={
                       <Checkbox 
                         size="small" 
                         checked={filters.levels?.includes(level.value)}
                         onChange={(e) => {
                           setFilters(prev => {
                             const newLevels = e.target.checked 
                               ? [...(prev.levels || []), level.value]
                               : (prev.levels || []).filter(l => l !== level.value)
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

          {/* Right Side: Results */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
             {isSearching && (!searchResults || searchResults.data.length === 0) ? (
               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                 <CircularProgress />
               </Box>
             ) : searchResults?.data?.length === 0 ? (
               <Typography color="text.secondary" textAlign="center" mt={4}>No results found</Typography>
             ) : (
               <List sx={{ p: 0 }}>
                 {searchResults?.data?.map(course => (
                   <ListItem 
                     key={course.id} 
                     sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' }, borderRadius: 1, mb: 1, px: 1, alignItems: 'flex-start' }}
                     onClick={() => {
                        setSearchAnchorEl(null)
                        router.push(`/authenticated/course/${course.id}`)
                     }}
                   >
                     <ListItemAvatar>
                       <Avatar 
                         variant="rounded" 
                         src={course.thumbnail_url || ''} 
                         sx={{ width: 100, height: 60, mr: 2 }}
                       />
                     </ListItemAvatar>
                     <ListItemText 
                       primary={
                         <Typography variant="subtitle2" fontWeight={600} noWrap title={course.title}>
                           {course.title}
                         </Typography>
                       }
                       secondary={
                         <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                           <span>{course.user?.name || 'Instructor'} • {course.course_level}</span>
                           <span style={{ fontWeight: 600, color: '#d32f2f', marginTop: '2px' }}>
                             {Number(course.price) === 0 ? 'Free' : `$${Number(course.price).toLocaleString()}`}
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

            return (
              <Typography
                key={item.path}
                onClick={() => router.push(item.path)}
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
      {/* Right:  Profile */}
      {userData ? (
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
                authUtils.clearAuth()
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
