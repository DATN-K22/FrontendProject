'use client'

import { use, useEffect, useState } from 'react'
import { Box, Typography, Button, CircularProgress, Alert, Snackbar } from '@mui/material'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import MessageItem from '@/components/instructor/forum/MessageItem'
import MessageInput from '@/components/instructor/forum/MessageInput'
import { useMessagesByForum, useCreateMessage, useUpdateMessage, useDeleteMessage } from '@/hooks/useMessages'
import { authUtils } from '@/utils/auth'

export default function ForumMessagesPage({ params }: { params: Promise<{ forumId: string }> }) {
  const router = useRouter()
  const { forumId } = use(params)

  const { messages, loading, error, fetchMessages, setMessages } = useMessagesByForum(forumId)
  const { create, loading: createLoading } = useCreateMessage()
  const { update, loading: updateLoading } = useUpdateMessage()
  const { remove } = useDeleteMessage()

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const { userData } = authUtils.getAuth()
    setCurrentUser(userData)
  }, [])

  useEffect(() => {
    if (forumId) {
      fetchMessages()
    }
  }, [forumId])

  const showToast = (msg: string, sev: 'success' | 'error' = 'success') => setToast({ open: true, message: msg, severity: sev })

  const handleCreateParent = async (content: string) => {
    if (!currentUser) return showToast('Bạn chưa đăng nhập', 'error')
    
    const payload = {
      forum_id: Number(forumId),
      user_id: currentUser.id || currentUser.sub,
      parent_message_id: null,
      content,
      status: 'active'
    }

    const created = await create(payload)
    if (created) {
      setMessages(prev => [created, ...prev])
      showToast('Đã gửi tin nhắn')
    } else {
      showToast('Gửi tin nhắn thất bại', 'error')
    }
  }

  const handleReply = async (parentId: string, content: string) => {
    if (!currentUser) return showToast('Bạn chưa đăng nhập', 'error')
    const payload = {
      forum_id: Number(forumId),
      user_id: currentUser.id || currentUser.sub,
      parent_message_id: Number(parentId), 
      content,
      status: 'active'
    }

    const created = await create(payload)
    if (created) {
      setMessages(prev => prev.map(m => {
        if (String(m.id) === String(parentId)) {
          return { ...m, replies: [...(m.replies || []), created] }
        }
        return m
      }))
      showToast('Đã gửi phản hồi')
    } else {
      showToast('Gửi phản hồi thất bại', 'error')
    }
  }

  const handleEdit = async (id: string, content: string) => {
    const updated = await update(id, { content })
    if (updated) {
      setMessages(prev => prev.map(m => {
        if (String(m.id) === String(id)) return { ...m, ...updated }
        if (m.replies) {
          const newReplies = m.replies.map((r: any) => String(r.id) === String(id) ? { ...r, ...updated } : r)
          return { ...m, replies: newReplies }
        }
        return m
      }))
      showToast('Đã cập nhật tin nhắn')
    } else {
      showToast('Cập nhật thất bại', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa tin nhắn này không?")) return;

    const ok = await remove(id)
    if (ok) {
      setMessages(prev => prev.filter(m => String(m.id) !== String(id)).map(m => {
        if (m.replies) {
          return { ...m, replies: m.replies.filter((r: any) => String(r.id) !== String(id)) }
        }
        return m
      }))
      showToast('Đã xóa tin nhắn')
    } else {
      showToast('Xóa thất bại', 'error')
    }
  }

  return (
    <Box sx={{ p: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button 
          startIcon={<ArrowLeft size={16} />} 
          variant="outlined" 
          onClick={() => router.push('/authenticated/instructor/forum')}
          sx={{ borderRadius: 2, textTransform: 'none' }}
          color="inherit"
        >
          Quay lại
        </Button>
        <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#111827', letterSpacing: '-0.02em' }}>
          Trao đổi / Thảo luận
        </Typography>
      </Box>

      <Box sx={{ mb: 4, p: 3, bgcolor: '#ffffff', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>Tạo chủ đề thảo luận mới</Typography>
        <MessageInput onSubmit={handleCreateParent} loading={createLoading} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
              <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>Chưa có thảo luận nào trong diễn đàn này.</Typography>
              <Typography sx={{ color: '#94a3b8', mt: 1 }}>Hãy là người đầu tiên bắt đầu cuộc trò chuyện!</Typography>
            </Box>
          ) : (
            messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUser={currentUser}
              />
            ))
          )}
        </Box>
      )}

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({...t, open: false}))}>
        <Alert severity={toast.severity as any}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  )
}
