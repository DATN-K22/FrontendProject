import { Paper, Box, Typography, Chip, Avatar } from '@mui/material'

export default function ForumCard({ forum, onClick }) {
  return (
    <Paper
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
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
          <Avatar
            src={forum.thumbnail_url}
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
            {forum.course?.title?.[0] || 'F'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>
                {forum.course?.title}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                · {forum._count?.messages ?? 0} messages
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827', mb: 1.5, lineHeight: 1.4 }}>
              {forum.short_description}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 1 }}>{forum.long_description}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
