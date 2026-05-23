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
  Menu
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import SettingsIcon from '@mui/icons-material/Settings'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import { usePathname, useRouter } from 'next/navigation'
import { authUtils } from '@/utils/auth'
import { useEffect, useState } from 'react'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [userData, setUserData] = useState<null | ReturnType<typeof authUtils.getAuth>['userData']>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const { userData } = authUtils.getAuth()
    setUserData(userData)
    setIsLoading(false)
  }, [])

  const open = Boolean(anchorEl)
  const menus: Array<{ label: string; path: string; external?: boolean }> = [
    { label: 'Home', path: '/' },
    {
      label: 'My course',
      path: '/authenticated/course/my-courses'
    },
    { label: 'Calendar', path: '/authenticated/schedule' }
  ]

  if (userData?.roles?.includes('teacher')) {
    menus.push({
      label: 'Lab configuration',
      path: 'https://d1rj9bz6vwjklr.cloudfront.net/',
      external: true
    })
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
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
            sx={{
              fontSize: { xs: '0.875rem', md: '1rem' },
              color: '#000',
              width: '100%'
            }}
          />
        </Box>
      </Stack>
      {userData && (
        <Stack direction='row' spacing={5} alignItems='center' sx={{ display: { xs: 'none', md: 'flex' } }}>
          {menus.map((item) => {
            const isActive = pathname === item.path

            return (
              <Typography
                key={item.path}
                onClick={() => {
                  if (item.external) {
                    window.location.href = item.path
                  } else {
                    router.push(item.path)
                  }
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
