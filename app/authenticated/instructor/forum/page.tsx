'use client'
import { Box, Typography, Paper, Avatar, Chip } from '@mui/material'
import { MessageSquare, ThumbsUp } from 'lucide-react'

const threads = [
  {
    id: 1,
    author: 'Alice Nguyen',
    course: "Beginner's Guide to Design",
    question: 'What is the difference between UX and UI design?',
    replies: 4,
    likes: 12,
    time: '2h ago',
    answered: true
  },
  {
    id: 2,
    author: 'Bob Tran',
    course: 'Advanced UI/UX Patterns',
    question: 'Can someone explain atomic design methodology?',
    replies: 2,
    likes: 7,
    time: '5h ago',
    answered: false
  },
  {
    id: 3,
    author: 'Carol Le',
    course: 'Mastering Figma',
    question: 'How do I create reusable components in Figma?',
    replies: 6,
    likes: 20,
    time: '1d ago',
    answered: true
  },
  {
    id: 4,
    author: 'David Pham',
    course: 'Design Systems at Scale',
    question: 'Best practices for maintaining a design system?',
    replies: 1,
    likes: 5,
    time: '2d ago',
    answered: false
  }
]

export default function ForumPage() {
  return (
    <Box sx={{ p: '28px 32px' }}>
      <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#111827', letterSpacing: '-0.02em', mb: 3 }}>
        Forum / Q&A
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {threads.map((t) => (
          <Paper
            key={t.id}
            elevation={0}
            sx={{
              border: '1.5px solid #e8edf2',
              borderRadius: '14px',
              p: '20px 22px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s, transform 0.2s',
              '&:hover': { boxShadow: '0 8px 28px rgba(0,0,0,0.09)', transform: 'translateY(-2px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {t.author[0]}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{t.author}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>in</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>{t.course}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#cbd5e1' }}>· {t.time}</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', mb: 1.5, lineHeight: 1.4 }}>
                    {t.question}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                      <MessageSquare size={14} />
                      <Typography sx={{ fontSize: '0.78rem' }}>{t.replies} replies</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94a3b8' }}>
                      <ThumbsUp size={14} />
                      <Typography sx={{ fontSize: '0.78rem' }}>{t.likes}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Chip
                label={t.answered ? 'Answered' : 'Open'}
                size='small'
                sx={
                  t.answered
                    ? {
                        backgroundColor: '#f0fdf4',
                        color: '#16a34a',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        border: '1px solid #16a34a22',
                        height: 24
                      }
                    : {
                        backgroundColor: '#fff7ed',
                        color: '#ea580c',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        border: '1px solid #ea580c22',
                        height: 24
                      }
                }
              />
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  )
}
