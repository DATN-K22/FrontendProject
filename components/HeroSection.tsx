'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, Container, Typography } from '@mui/material'

export default function LearnAideHeroSection() {
  const heroRef = useRef<HTMLDivElement | null>(null)
  const [fade, setFade] = useState<number>(1)

  useEffect(() => {
    let rafId: number | null = null

    const onScroll = () => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      const height = rect.height || window.innerHeight
      // distance the element has moved past the top of viewport
      const distanceScrolled = Math.max(0, -rect.top)
      // fade out over ~60% of the element height
      const fadeProgress = Math.min(1, distanceScrolled / (height * 0.6))
      const next = Math.max(0, 1 - fadeProgress)
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => setFade(next))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <Box
      ref={heroRef}
      sx={{
        backgroundImage: { md: 'url(/images/hero.png)' },
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',

        width: '100%',
        minHeight: '80vh',

        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        opacity: fade,
        transform: `translateY(${(1 - fade) * -16}px)`,
        transition: 'opacity 160ms linear, transform 160ms linear'
      }}
    >
      <Container
        maxWidth='xl'
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' },
          gap: { xs: 3, md: 6 },
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            pl: { xs: 0, md: 4 },
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 0,
              mb: 2
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' },
                fontWeight: 800,
                color: '#FFD600',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                animation: 'slideDown 700ms ease-out both',
                animationDelay: '0ms'
              }}
            >
              LEARN
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' },
                fontWeight: 800,
                color: '#1a2d3a',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                animation: 'slideDown 700ms ease-out both',
                animationDelay: '120ms'
              }}
            >
              AIDE
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '2rem' },
              fontWeight: 600,
              color: '#1a2d3a',
              lineHeight: 1.6,
              letterSpacing: '0.02em',
              fontFamily: "'Georgia', serif",
              textAlign: 'justify',
              animation: 'slideDown 700ms ease-out both',
              animationDelay: '240ms'
            }}
          >
            ONLINE PLATFORM FOR LEARNING AND PRACTICING CLOUD COMPUTING ON AWS WITH INTEGRATED AI AGENT
          </Typography>
        </Box>
      </Container>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  )
}
