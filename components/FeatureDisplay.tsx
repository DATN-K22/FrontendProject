'use client'

import { Box, Container, Typography } from '@mui/material'
import Image from 'next/image'
import { useScrollRevealList } from '@/hooks/useScrollRevealList'

export type FeatureDisplayProps = {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  background?: string
  imagePosition?: 'left' | 'right'
  direction?: 'left' | 'right'
}

export default function FeatureDisplay({
  title,
  description,
  imageSrc,
  imageAlt,
  background = '#FFFFFF',
  imagePosition = 'right',
  direction = 'left'
}: FeatureDisplayProps) {
  const { setItemRef, getItemStyle, durationMs, easing } = useScrollRevealList({
    direction
  })
  const isImageLeft = imagePosition === 'left'

  return (
    <Box
      sx={{
        width: '100%',
        background,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        py: { xs: 6, md: 8 }
      }}
    >
      <Container
        ref={setItemRef(0)}
        maxWidth='xl'
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: imagePosition === 'right' ? '1fr 2fr' : '2fr 1fr' },
          gap: { xs: 6, md: 10 },
          alignItems: 'center',
          px: { xs: 3, sm: 4, md: 8 },
          transition: `transform ${durationMs}ms ${easing}, opacity 240ms linear`,
          ...getItemStyle(0)
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            order: { xs: 2, lg: isImageLeft ? 2 : 1 }
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                color: '#1a2d3a',
                lineHeight: 1.2,
                mb: 3
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: '#555555',
                lineHeight: 1.8,
                maxWidth: '100%',
                textAlign: 'justify'
              }}
            >
              {description}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: '400px', sm: '500px', md: '600px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            order: { xs: 1, md: isImageLeft ? 1 : 2 },
            border: '1px solid #e0e0e0',
            borderRadius: 10,
            overflow: 'hidden'
          }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes='(max-width: 600px) 100vw,
           (max-width: 900px) 100vw,
           50vw'
            style={{
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </Box>
      </Container>
    </Box>
  )
}
