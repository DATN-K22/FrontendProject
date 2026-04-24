import { useState } from 'react'
import { Box, Typography, Button, IconButton, Avatar } from '@mui/material'
import { Edit2, Trash2, Reply, ChevronDown, ChevronUp } from 'lucide-react'
import MessageInput from './MessageInput'

interface MessageItemProps {
  message: any
  onReply: (parentId: string, content: string) => Promise<void>
  onEdit: (id: string, content: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  currentUser?: any
  isChild?: boolean
}

export default function MessageItem({
  message,
  onReply,
  onEdit,
  onDelete,
  currentUser,
  isChild = false
}: MessageItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Use user.id or user.sub depending on auth token structure
  const currentUserId = currentUser?.id || currentUser?.sub
  const isOwner = String(currentUserId) === String(message.user_id)
  const hasReplies = message.replies && message.replies.length > 0

  const handleReply = async (content: string) => {
    setSubmitting(true)
    await onReply(message.id, content)
    setSubmitting(false)
    setIsReplying(false)
    setShowReplies(true)
  }

  const handleEdit = async (content: string) => {
    setSubmitting(true)
    await onEdit(message.id, content)
    setSubmitting(false)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box
      sx={{
        p: isChild ? 2 : 2.5,
        mb: 2,
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        bgcolor: isChild ? '#f8fafc' : '#ffffff',
        ml: isChild ? 4 : 0,
        boxShadow: isChild ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: '#cbd5e1'
        }
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar src={message.user?.avatar} alt={message.user?.name || `User ${message.user_id}`} sx={{ width: 40, height: 40, bgcolor: '#3b82f6' }}>
          {message.user?.name?.[0] || 'U'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, color: '#1e293b' }}>
                {message.user?.name || `User ${message.user_id}`}
              </Typography>
              <Typography variant='caption' sx={{ color: '#64748b' }}>
                {formatDate(message.created_at)}
              </Typography>
            </Box>
            {isOwner && !isEditing && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size='small' onClick={() => setIsEditing(true)} sx={{ color: '#64748b', '&:hover': { color: '#3b82f6' } }}>
                  <Edit2 size={14} />
                </IconButton>
                <IconButton size='small' onClick={() => onDelete(message.id)} sx={{ color: '#64748b', '&:hover': { color: '#ef4444' } }}>
                  <Trash2 size={14} />
                </IconButton>
              </Box>
            )}
          </Box>

          {!isEditing ? (
            <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', mb: 1.5, color: '#334155', lineHeight: 1.6 }}>
              {message.content}
            </Typography>
          ) : (
            <Box sx={{ mb: 2 }}>
              <MessageInput
                initialValue={message.content}
                onSubmit={handleEdit}
                onCancel={() => setIsEditing(false)}
                loading={submitting}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {!isChild && !isEditing && (
              <Button
                size='small'
                startIcon={<Reply size={14} />}
                onClick={() => setIsReplying(!isReplying)}
                sx={{ textTransform: 'none', color: '#64748b', minWidth: 'auto', p: 0, '&:hover': { bgcolor: 'transparent', color: '#3b82f6' } }}
              >
                Phản hồi
              </Button>
            )}
            {hasReplies && !isChild && (
              <Button
                size='small'
                startIcon={showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                onClick={() => setShowReplies(!showReplies)}
                sx={{ textTransform: 'none', color: '#64748b', minWidth: 'auto', p: 0, '&:hover': { bgcolor: 'transparent', color: '#3b82f6' } }}
              >
                {showReplies ? 'Ẩn câu trả lời' : `Xem ${message.replies.length} câu trả lời`}
              </Button>
            )}
          </Box>

          {isReplying && (
            <Box sx={{ mt: 2 }}>
              <MessageInput
                onSubmit={handleReply}
                onCancel={() => setIsReplying(false)}
                loading={submitting}
                placeholder="Nhập câu trả lời của bạn..."
              />
            </Box>
          )}

          {showReplies && message.replies && (
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {message.replies.map((reply: any) => (
                <MessageItem
                  key={reply.id}
                  message={reply}
                  onReply={onReply} // replies to parent message usually
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUser={currentUser}
                  isChild={true}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
