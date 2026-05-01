'use client'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Tabs,
  Tab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  CircularProgress,
  Divider,
  Tooltip
} from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import {
  FileVideo,
  FileText,
  Image as ImageIcon,
  Trash2,
  Upload,
  ExternalLink,
  X,
  Plus,
  AlertCircle
} from 'lucide-react'
import { useFilesByLesson, useUploadFile, useDeleteFile } from '@/hooks/useFiles'
import { FileResourceType, FileResource } from '@/api/courses/types'

interface ResourceModalProps {
  open: boolean
  onClose: () => void
  lessonId: string | number
  courseId: string | number
  lessonTitle: string
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

export default function ResourceModal({ open, onClose, lessonId, courseId, lessonTitle }: ResourceModalProps) {
  const [tab, setTab] = useState(0)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState<FileResourceType>('video')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { resources, loading, fetchResources, setResources } = useFilesByLesson(lessonId)
  const { upload, uploading, progress, error: uploadError } = useUploadFile()
  const { remove, deleting } = useDeleteFile()

  useEffect(() => {
    if (open && lessonId) {
      fetchResources()
    }
  }, [open, lessonId, fetchResources])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (!uploadTitle) {
        // Auto-fill title with filename (without extension)
        const nameWithoutExt = file.name.split('.').slice(0, -1).join('.')
        setUploadTitle(nameWithoutExt)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle) return

    const result = await upload(selectedFile, {
      title: uploadTitle,
      type: uploadType,
      lesson_id: String(lessonId),
      course_id: String(courseId)
    })

    if (result) {
      // Clear form
      setUploadTitle('')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      // Refresh resources
      fetchResources()
      setTab(0) // Switch to list view
    }
  }

  const handleDelete = async (file: FileResource) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài nguyên "${file.title}"?`)) {
      const ok = await remove(file.id)
      if (ok) {
        // Update local state to avoid full re-fetch
        setResources((prev) => ({
          ...prev,
          [file.type]: prev[file.type].filter((f) => f.id !== file.id)
        }))
      }
    }
  }

  const renderFileList = (files: FileResource[], type: FileResourceType) => {
    if (files.length === 0) {
      return (
        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary', bgcolor: '#f8fafc', borderRadius: 2 }}>
          <Typography variant='body2'>Chưa có tài nguyên nào cho mục này</Typography>
        </Box>
      )
    }

    return (
      <List sx={{ pt: 0 }}>
        {files.map((file) => (
          <ListItem
            key={file.id}
            sx={{
              mb: 1,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              '&:hover': { bgcolor: '#f8fafc' },
              transition: 'background-color 0.2s'
            }}
            secondaryAction={
              <Box>
                {file.link && (
                  <Tooltip title='Xem tập tin'>
                    <IconButton size='small' component='a' href={file.link} target='_blank' sx={{ mr: 1, color: '#3b82f6' }}>
                      <ExternalLink size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title='Xóa'>
                  <IconButton size='small' color='error' onClick={() => handleDelete(file)} disabled={deleting}>
                    <Trash2 size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            <ListItemIcon sx={{ minWidth: 40, color: type === 'video' ? '#ef4444' : type === 'document' ? '#3b82f6' : '#10b981' }}>
              {type === 'video' ? <FileVideo size={22} /> : type === 'document' ? <FileText size={22} /> : <ImageIcon size={22} />}
            </ListItemIcon>
            <ListItemText
              primary={file.title}
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
              secondary={file.filename}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          </ListItem>
        ))}
      </List>
    )
  }

  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth='md' fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#111827' }}>
            Tài nguyên bài học
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Lesson: {lessonTitle}
          </Typography>
        </Box>
        {!uploading && (
          <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
            <X size={20} />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 40 }}>
            <Tab label='Danh sách' sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label='Tải lên mới' icon={<Plus size={16} />} iconPosition='start' sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* List View */}
        <TabPanel value={tab} index={0}>
          {loading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={30} sx={{ color: '#2563eb' }} />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Đang tải danh sách...</Typography>
            </Box>
          ) : (
            <Box>
              <Typography color='text.secondary' variant='subtitle2' sx={{ mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileVideo size={16} /> Video bài giảng
              </Typography>
              {renderFileList(resources.video, 'video')}

              <Typography color='text.secondary' variant='subtitle2' sx={{ mt: 3, mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FileText size={16} /> Tài liệu (PDF, Docs...)
              </Typography>
              {renderFileList(resources.document, 'document')}

              <Typography color='text.secondary' variant='subtitle2' sx={{ mt: 3, mb: 1, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon size={16} /> Hình ảnh minh họa
              </Typography>
              {renderFileList(resources.image, 'image')}
            </Box>
          )}
        </TabPanel>

        {/* Upload View */}
        <TabPanel value={tab} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <TextField
              label='Tiêu đề tài nguyên *'
              placeholder='Ví dụ: Video hướng dẫn cài đặt'
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              fullWidth
              size='small'
              disabled={uploading}
            />

            <TextField
              select
              label='Loại tài nguyên *'
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as FileResourceType)}
              fullWidth
              size='small'
              disabled={uploading}
            >
              <MenuItem value='video'>Video bài giảng</MenuItem>
              <MenuItem value='document'>Tài liệu</MenuItem>
              <MenuItem value='image'>Hình ảnh</MenuItem>
            </TextField>

            <Box>
              <input
                type='file'
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={
                  uploadType === 'video' 
                    ? 'video/*' 
                    : uploadType === 'image' 
                    ? 'image/*' 
                    : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip'
                }
              />
              <Button
                variant='outlined'
                startIcon={<Upload size={18} />}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                disabled={uploading}
                sx={{ 
                  py: 1.5, 
                  borderStyle: 'dashed', 
                  borderWidth: 2,
                  borderColor: selectedFile ? '#2563eb' : '#cbd5e1',
                  bgcolor: selectedFile ? '#eff6ff' : 'transparent',
                  '&:hover': { borderWidth: 2, bgcolor: '#f1f5f9' }
                }}
              >
                {selectedFile ? selectedFile.name : 'Chọn tập tin cần tải lên'}
              </Button>
            </Box>

            {uploading && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant='caption' fontWeight={600} color='primary'>
                    Đang tải lên: {progress}%
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {selectedFile?.name}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant='determinate' 
                  value={progress} 
                  sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { borderRadius: 4 } }} 
                />
              </Box>
            )}

            {uploadError && (
              <Box sx={{ bgcolor: '#fef2f2', p: 1.5, borderRadius: 2, display: 'flex', gap: 1, alignItems: 'center', border: '1px solid #fecaca' }}>
                <AlertCircle size={18} color='#ef4444' />
                <Typography color='#ef4444' variant='caption'>
                  {uploadError}
                </Typography>
              </Box>
            )}

            <Button
              variant='contained'
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !uploadTitle}
              fullWidth
              sx={{ 
                py: 1.2, 
                fontWeight: 700, 
                textTransform: 'none', 
                boxShadow: 'none',
                borderRadius: '10px'
              }}
            >
              {uploading ? 'Đang tải lên...' : 'Bắt đầu tải lên'}
            </Button>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={uploading} sx={{ color: '#64748b', fontWeight: 600 }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  )
}
