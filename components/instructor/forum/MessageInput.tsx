import { useState } from 'react'
import { Box, TextField, Button } from '@mui/material'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSubmit: (content: string) => Promise<void>
  placeholder?: string
  loading?: boolean
  initialValue?: string
  onCancel?: () => void
}

export default function MessageInput({
  onSubmit,
  placeholder = 'Nhập tin nhắn...',
  loading,
  initialValue = '',
  onCancel
}: MessageInputProps) {
  const [content, setContent] = useState(initialValue)

  const handleSubmit = async () => {
    if (!content.trim()) return
    await onSubmit(content)
    if (!initialValue) setContent('')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, width: '100%' }}>
      <TextField
        multiline
        minRows={2}
        fullWidth
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
        variant="outlined"
        size="small"
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {onCancel && (
          <Button onClick={onCancel} disabled={loading} size="small" variant="text" color="inherit">
            Hủy
          </Button>
        )}
        <Button
          variant='contained'
          color='primary'
          size="small"
          endIcon={<Send size={16} />}
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {initialValue ? 'Cập nhật' : 'Gửi'}
        </Button>
      </Box>
    </Box>
  )
}
