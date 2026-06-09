'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Divider,
  Container
} from '@mui/material'
import {
  Video,
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink
} from 'lucide-react'
import {
  useMultipartUploadVideo,
  VideoUploadStatus,
  deleteFile,
  getFilesByChapterItemId,
  useUploadDocuments
} from '@/hooks/useMediaFile'
import { FileResource, LessonResources } from '@/api/courses/types'
import { useAlert } from '@/components/Alert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ConfirmModal from '@/components/Confirm'

// ─── Constants ────────────────────────────────────────────────────────────────

const VIDEO_STATUS_CONFIG: Record<VideoUploadStatus, { label: string; color: string; Icon: any }> = {
  idle: { label: 'No video uploaded', color: '#94a3b8', Icon: Upload },
  uploading: { label: 'Uploading...', color: '#2563eb', Icon: Loader },
  processing: { label: 'Processing (HLS)...', color: '#f59e0b', Icon: Loader },
  ready: { label: 'Ready', color: '#10b981', Icon: CheckCircle },
  error: { label: 'Upload failed', color: '#ef4444', Icon: AlertCircle }
}

const sectionSx = {
  p: 3,
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  bgcolor: '#fff'
}

const emptyLessonResources: LessonResources = { video: [], document: [], image: [] }

// ─── Confirm dialog state ─────────────────────────────────────────────────────

interface ConfirmState {
  open: boolean
  title: string
  description: string
  onConfirm: () => Promise<void>
}

type LessonResourceLoadingSource = 'initial' | 'video' | 'documents' | null

const closedConfirm: ConfirmState = {
  open: false,
  title: '',
  description: '',
  onConfirm: async () => {}
}

// ─── Shared hook: fetch & delete resources ────────────────────────────────────

function useLessonResources(
  lessonId: string,
  // Nhận callback mở modal từ page — hook không tự render UI
  openConfirm: (file: FileResource) => void
) {
  const [resources, setResources] = useState<LessonResources>(emptyLessonResources)
  const [loadingSource, setLoadingSource] = useState<LessonResourceLoadingSource>('initial')
  const [deletingId, setDeletingId] = useState<string | number | null>(null)
  const { showAlert } = useAlert()

  const refresh = useCallback(
    async (source: Exclude<LessonResourceLoadingSource, null> = 'initial') => {
      if (!lessonId) return
      setLoadingSource(source)
      try {
        const response = await getFilesByChapterItemId(lessonId)
        if (response.success) {
          setResources(response.data ?? emptyLessonResources)
        } else {
          setResources(emptyLessonResources)
          showAlert(response.message || 'Cannot load lesson files', 'error')
        }
      } catch (err: any) {
        setResources(emptyLessonResources)
        showAlert(err?.message || 'Cannot connect to server', 'error')
      } finally {
        setLoadingSource(null)
      }
    },
    [lessonId, showAlert]
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  // Thực thi xóa sau khi user đã confirm trong modal
  const confirmDelete = useCallback(
    async (file: FileResource) => {
      setDeletingId(file.id)
      try {
        const response = await deleteFile(file.id)
        if (!response.success) {
          showAlert(response.message || 'Delete failed', 'error')
          return
        }
        await refresh(file.type === 'video' ? 'video' : 'documents')
      } catch (err: any) {
        showAlert(err?.message || 'Delete failed', 'error')
      } finally {
        setDeletingId(null)
      }
    },
    [refresh, showAlert]
  )

  // Chỉ mở modal — không tự xóa
  const deleteResource = useCallback((file: FileResource) => openConfirm(file), [openConfirm])

  return { resources, loadingSource, deletingId, refresh, deleteResource, confirmDelete }
}

// ─── Existing file row ────────────────────────────────────────────────────────

function ExistingFileRow({
  file,
  deletingId,
  onDelete
}: {
  file: FileResource
  deletingId: string | number | null
  onDelete: (file: FileResource) => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        bgcolor: '#fafafa'
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, color: '#111827' }}>{file.title}</Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#64748b',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {file.filename}
        </Typography>
      </Box>

      {file.link && (
        <Tooltip title='Open file'>
          <IconButton
            component='a'
            href={file.link}
            target='_blank'
            rel='noreferrer'
            size='small'
            sx={{ color: '#2563eb' }}
          >
            <ExternalLink size={16} />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title='Delete file'>
        <span>
          <IconButton size='small' color='error' onClick={() => onDelete(file)} disabled={deletingId === file.id}>
            {deletingId === file.id ? <CircularProgress size={16} sx={{ color: '#ef4444' }} /> : <Trash2 size={16} />}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

// ─── Video Section ────────────────────────────────────────────────────────────

function VideoSection({
  courseId,
  lessonId,
  resources,
  loadingSource,
  deletingId,
  refresh,
  deleteResource
}: {
  courseId: string
  lessonId: string
  resources: LessonResources
  loadingSource: LessonResourceLoadingSource
  deletingId: string | number | null
  refresh: (source?: Exclude<LessonResourceLoadingSource, null>) => Promise<void>
  deleteResource: (file: FileResource) => void
}) {
  const { state, upload, resume, cancel } = useMultipartUploadVideo(courseId, lessonId)
  const statusCfg = VIDEO_STATUS_CONFIG[state.status]
  const previousStatusRef = useRef<VideoUploadStatus>(state.status)

  useEffect(() => {
    if (previousStatusRef.current !== 'ready' && state.status === 'ready') {
      refresh('video')
    }
    previousStatusRef.current = state.status
  }, [state.status, refresh])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const savedUploadId = sessionStorage.getItem(`uploadId:${lessonId}`)
    if (savedUploadId && state.status === 'error') {
      resume(file, savedUploadId)
    } else {
      upload(file)
    }
  }

  const isActive = state.status === 'uploading' || state.status === 'processing'
  const isLoading = loadingSource === 'initial' || loadingSource === 'video'

  return (
    <Box sx={sectionSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(37,99,235,0.08)' }}>
          <Video size={20} color='#2563eb' />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Video</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>MP4 only · 1 video per lesson</Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={statusCfg.label}
            size='small'
            icon={<statusCfg.Icon size={12} color={statusCfg.color} />}
            sx={{
              fontSize: '0.72rem',
              color: statusCfg.color,
              borderColor: statusCfg.color,
              bgcolor: `${statusCfg.color}12`
            }}
            variant='outlined'
          />
          <IconButton size='small' onClick={() => refresh('video')} sx={{ color: '#64748b' }}>
            <RefreshCw size={15} />
          </IconButton>
          <Button
            component='label'
            variant='outlined'
            size='small'
            disabled={state.status === 'ready' || isActive}
            startIcon={<Upload size={14} />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.8rem',
              borderColor: '#e2e8f0',
              color: '#374151',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
            }}
          >
            {state.status === 'error' ? 'Retry / Choose file' : 'Choose MP4 file'}
            <input type='file' hidden accept='video/mp4' onChange={handleFileChange} />
          </Button>
        </Box>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 999, height: 4 }} />}

      {!isLoading && resources.video.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
          {resources.video.map((file) => (
            <ExistingFileRow key={file.id} file={file} deletingId={deletingId} onDelete={deleteResource} />
          ))}
        </Box>
      )}

      {isActive && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              {state.status === 'uploading' ? `Uploading parts... ${state.progress}%` : 'Processing HLS stream...'}
            </Typography>
            {state.status === 'uploading' && (
              <Typography sx={{ fontSize: '0.75rem', color: '#ef4444', cursor: 'pointer' }} onClick={cancel}>
                Cancel
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant={state.status === 'processing' ? 'indeterminate' : 'determinate'}
            value={state.progress}
            sx={{
              borderRadius: 4,
              height: 6,
              bgcolor: '#f1f5f9',
              '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' }
            }}
          />
        </Box>
      )}
    </Box>
  )
}

// ─── Documents Section ────────────────────────────────────────────────────────

function DocumentsSection({
  courseId,
  lessonId,
  resources,
  loadingSource,
  deletingId,
  refresh,
  deleteResource
}: {
  courseId: string
  lessonId: string
  resources: LessonResources
  loadingSource: LessonResourceLoadingSource
  deletingId: string | number | null
  refresh: (source?: Exclude<LessonResourceLoadingSource, null>) => Promise<void>
  deleteResource: (file: FileResource) => void
}) {
  const { documents, addFiles, retry, remove } = useUploadDocuments(courseId, lessonId)
  const previousDoneCountRef = useRef(0)

  useEffect(() => {
    const doneCount = documents.filter((doc) => doc.status === 'done').length
    if (doneCount > previousDoneCountRef.current) refresh('documents')
    previousDoneCountRef.current = doneCount
  }, [documents, refresh])

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type === 'application/pdf')
    if (files.length) addFiles(files)
    e.target.value = ''
  }

  const existingDocs = [...resources.document, ...resources.image]
  const isLoading = loadingSource === 'initial' || loadingSource === 'documents'

  return (
    <Box sx={sectionSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(16,185,129,0.08)' }}>
          <FileText size={20} color='#10b981' />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>Documents</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>PDF only · Multiple files allowed</Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size='small' onClick={() => refresh('documents')} sx={{ color: '#64748b' }}>
            <RefreshCw size={15} />
          </IconButton>
          <Button
            component='label'
            size='small'
            variant='outlined'
            startIcon={<Upload size={13} />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.78rem',
              borderColor: '#e2e8f0',
              color: '#374151',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
            }}
          >
            Add PDFs
            <input type='file' hidden accept='application/pdf' multiple onChange={handleFiles} />
          </Button>
        </Box>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 999, height: 4 }} />}

      {!isLoading && existingDocs.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
          {existingDocs.map((file) => (
            <ExistingFileRow key={file.id} file={file} deletingId={deletingId} onDelete={deleteResource} />
          ))}
        </Box>
      )}

      {!isLoading && existingDocs.length > 0 && documents.length > 0 && <Divider sx={{ mb: 2.5 }} />}

      {documents.length === 0 && !isLoading && existingDocs.length === 0 && (
        <Box
          sx={{
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            color: '#94a3b8',
            border: '1.5px dashed #e2e8f0',
            borderRadius: '12px'
          }}
        >
          <FileText size={28} strokeWidth={1.5} />
          <Typography sx={{ fontSize: '0.82rem' }}>No documents uploaded yet</Typography>
        </Box>
      )}

      {documents.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {documents.map((doc) => (
            <Box key={doc.id} sx={{ p: 1.5, borderRadius: '10px', border: '1px solid #e2e8f0', bgcolor: '#fafafa' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <FileText size={15} color='#64748b' />
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    color: '#374151',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {doc.file.name}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>
                  {(doc.file.size / 1024 / 1024).toFixed(1)} MB
                </Typography>

                {doc.status === 'done' && <CheckCircle size={15} color='#10b981' />}
                {doc.status === 'error' && (
                  <Tooltip title={doc.error ?? 'Upload failed'}>
                    <AlertCircle size={15} color='#ef4444' />
                  </Tooltip>
                )}
                {doc.status === 'uploading' && <Loader size={15} color='#2563eb' />}

                {doc.status === 'error' && (
                  <IconButton size='small' onClick={() => retry(doc.id)} sx={{ color: '#2563eb', p: 0.5 }}>
                    <RefreshCw size={13} />
                  </IconButton>
                )}
                <IconButton size='small' onClick={() => remove(doc.id)} sx={{ color: '#ef4444', p: 0.5 }}>
                  <Trash2 size={13} />
                </IconButton>
              </Box>

              {doc.status === 'uploading' && (
                <LinearProgress
                  variant='determinate'
                  value={doc.progress}
                  sx={{
                    mt: 1,
                    borderRadius: 4,
                    height: 3,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' }
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LessonMediaPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string
  const router = useRouter()

  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>(closedConfirm)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // openConfirm sống ở page vì cần setConfirmDialog + setDeleteLoading
  // confirmDelete sẽ được truyền vào sau khi hook trả về
  const openConfirmRef = useRef<(file: FileResource) => void>(() => {})

  const { resources, loadingSource, deletingId, refresh, deleteResource, confirmDelete } = useLessonResources(
    lessonId,
    (file) => openConfirmRef.current(file)
  )

  // Gán sau khi confirmDelete đã sẵn sàng từ hook
  openConfirmRef.current = useCallback(
    (file: FileResource) => {
      setConfirmDialog({
        open: true,
        title: 'Delete file',
        description: `Are you sure you want to delete "${file.title}"? This action cannot be undone.`,
        onConfirm: async () => {
          setDeleteLoading(true)
          try {
            await confirmDelete(file)
          } finally {
            setDeleteLoading(false)
            setConfirmDialog(closedConfirm)
          }
        }
      })
    },
    [confirmDelete]
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
        pb: 8,
        px: 4
      }}
    >
      <Box sx={{ pt: 4, mb: 2 }}>
        <IconButton onClick={() => router.push(`/authenticated/course/${courseId}`)}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Container maxWidth='xl'>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant='h3'
            component='h1'
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' }
            }}
          >
            Lesson Media Resources
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <VideoSection
            courseId={courseId}
            lessonId={lessonId}
            resources={resources}
            loadingSource={loadingSource}
            deletingId={deletingId}
            refresh={refresh}
            deleteResource={deleteResource}
          />
          <DocumentsSection
            courseId={courseId}
            lessonId={lessonId}
            resources={resources}
            loadingSource={loadingSource}
            deletingId={deletingId}
            refresh={refresh}
            deleteResource={deleteResource}
          />
        </Box>
      </Container>

      {/* Render 1 modal duy nhất ở root page, tránh duplicate */}
      <ConfirmModal
        open={confirmDialog.open}
        onClose={() => !deleteLoading && setConfirmDialog(closedConfirm)}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel='Delete'
        variant='danger'
        loading={deleteLoading}
      />
    </Box>
  )
}
