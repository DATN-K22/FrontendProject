import { Box, Divider, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box
      component='footer'
      sx={{
        bgcolor: '#252641',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ px: { xs: 3, sm: 6, md: 10 }, pt: { xs: 8, md: 12 }, pb: { xs: 1, md: 2 } }}>
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 7, md: 10 }
          }}
        >
          <Typography
            variant='h2'
            sx={{
              fontWeight: 800,
              maxWidth: 900,
              mx: 'auto',
              fontSize: { xs: '1.8rem', md: '2.8rem', lg: '3.2rem' },
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Learn Cloud Computing,
            <Box
              component='span'
              sx={{
                display: 'block',
                background: '#FFD600',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Build Real Skills on AWS.
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: 2.5,
              maxWidth: 600,
              mx: 'auto',
              color: 'rgba(255,255,255,0.55)',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.7
            }}
          >
            Hands-on labs, structured paths, and an AI agent that guides you every step of the way.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} LearnAide. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
