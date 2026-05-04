// components/LessonModal.tsx
'use client'
import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material'
import { X, PlayCircle, FlaskConical, HelpCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonType = 'lesson' | 'lab' | 'quiz'

interface LessonFormState {
  title: string
  short_description: string
  long_description: string
  status: 'draft' | 'published' | 'archived'
  duration: number
  is_free?: boolean
  leaseTemplateId?: string
  instruction?: string
  lessonType: LessonType
}

interface LessonModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: LessonFormState) => Promise<void>
  editingLesson?: any | null
  loading?: boolean
  error?: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ['Select Type', 'Core Content']

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
]

const LESSON_TYPES = [
  {
    value: 'lesson' as LessonType,
    label: 'Lesson',
    description: 'Video or document-based content',
    Icon: PlayCircle,
    color: '#00bdd5',
    bg: 'rgba(0,189,213,0.08)'
  },
  {
    value: 'lab' as LessonType,
    label: 'Lab',
    description: 'Hands-on interactive lab environment',
    Icon: FlaskConical,
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)'
  },
  {
    value: 'quiz' as LessonType,
    label: 'Quiz',
    description: 'Assessment with questions and answers',
    Icon: HelpCircle,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)'
  }
]

const EMPTY_FORM: LessonFormState = {
  title: '',
  short_description: '',
  long_description: '',
  status: 'published',
  duration: 0,
  is_free: false,
  leaseTemplateId: '',
  instruction: '',
  lessonType: 'lesson'
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: '0.875rem',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#94a3b8' },
    '&.Mui-focused fieldset': { borderColor: '#2563eb' }
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2563eb' }
}

// ─── TypeSelector ─────────────────────────────────────────────────────────────

const TypeSelector = memo(
  ({ selected, onChange }: { selected: LessonType | null; onChange: (t: LessonType) => void }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 0.5 }}>
        Choose a type to continue. This cannot be changed after creation.
      </Typography>
      {LESSON_TYPES.map(({ value, label, description, Icon, color, bg }) => {
        const active = selected === value
        return (
          <Box
            key={value}
            onClick={() => onChange(value)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              border: active ? `2px solid ${color}` : '2px solid #e2e8f0',
              bgcolor: active ? bg : 'transparent',
              '&:hover': { border: `2px solid ${color}`, bgcolor: bg }
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                bgcolor: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid ${color}30`
              }}
            >
              <Icon size={22} color={color} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{label}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{description}</Typography>
            </Box>
            {active && (
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Check size={13} color='white' strokeWidth={3} />
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
)
TypeSelector.displayName = 'TypeSelector'

// ─── CoreForm ─────────────────────────────────────────────────────────────────

const CoreForm = memo(
  ({
    lessonType,
    form,
    onChange
  }: {
    lessonType: LessonType
    form: LessonFormState
    onChange: (field: keyof LessonFormState, value: any) => void
  }) => {
    const set = (field: keyof LessonFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(field, e.target.value)

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label='Title *' value={form.title} onChange={set('title')} fullWidth sx={fieldSx} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField select label='Status' value={form.status} onChange={set('status')} fullWidth sx={fieldSx}>
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.875rem' }}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          label='Short Description'
          value={form.short_description}
          onChange={set('short_description')}
          fullWidth
          multiline
          rows={2}
          sx={fieldSx}
        />

        {lessonType === 'lesson' && (
          <>
            <TextField
              label='Duration (seconds)'
              type='number'
              value={form.duration}
              onChange={(e) => onChange('duration', Number(e.target.value))}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              select
              label='Free Preview'
              value={form.is_free ? 'true' : 'false'}
              onChange={(e) => onChange('is_free', e.target.value === 'true')}
              fullWidth
              sx={fieldSx}
            >
              <MenuItem value='false' sx={{ fontSize: '0.875rem' }}>
                Locked
              </MenuItem>
              <MenuItem value='true' sx={{ fontSize: '0.875rem' }}>
                Free Preview
              </MenuItem>
            </TextField>
          </>
        )}

        {lessonType === 'lab' && (
          <>
            <TextField
              label='Lease Template ID'
              value={form.leaseTemplateId ?? ''}
              onChange={set('leaseTemplateId')}
              fullWidth
              placeholder='e.g. tmpl_abc123'
              sx={fieldSx}
            />
            <TextField
              label='Instructions'
              value={form.instruction ?? ''}
              onChange={set('instruction')}
              fullWidth
              multiline
              rows={4}
              placeholder='Markdown supported'
              sx={fieldSx}
            />
          </>
        )}

        {lessonType === 'quiz' && (
          <Box
            sx={{
              p: 2,
              borderRadius: '10px',
              bgcolor: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.25)'
            }}
          >
            <Typography sx={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 500 }}>
              Quiz questions are managed separately after creation.
            </Typography>
          </Box>
        )}

        <TextField
          label='Long Description'
          value={form.long_description}
          onChange={set('long_description')}
          fullWidth
          multiline
          rows={3}
          sx={fieldSx}
        />
      </Box>
    )
  }
)
CoreForm.displayName = 'CoreForm'

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function LessonModal({ open, onClose, onSubmit, editingLesson, loading }: LessonModalProps) {
  const isEdit = !!editingLesson
  const [step, setStep] = useState(0)
  const [lessonType, setLessonType] = useState<LessonType | null>(null)
  const [form, setForm] = useState<LessonFormState>(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    if (editingLesson) {
      setLessonType(editingLesson.type ?? 'lesson')
      setForm({ ...EMPTY_FORM, ...editingLesson })
      setStep(1)
    } else {
      setLessonType(null)
      setForm(EMPTY_FORM)
      setStep(0)
    }
  }, [open, editingLesson])

  const setField = useCallback((field: keyof LessonFormState, value: any) => {
    setForm((f) => ({ ...f, [field]: value }))
  }, [])

  const canProceed = useMemo(() => {
    if (step === 0) return lessonType !== null
    if (step === 1) return form.title.trim().length > 0
    return true
  }, [step, lessonType, form.title])

  const isLastStep = step === STEPS.length - 1

  const handleSubmit = async () => {
    if (!lessonType) return
    await onSubmit({ ...form, lessonType })
  }

  const selectedType = LESSON_TYPES.find((t) => t.value === lessonType)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px', p: 0, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>
            {isEdit ? 'Edit Lesson' : 'Add New Lesson'}
          </Typography>
          {selectedType && !isEdit && (
            <Chip
              label={selectedType.label}
              size='small'
              sx={{
                mt: 0.5,
                fontSize: '0.72rem',
                height: 20,
                bgcolor: selectedType.bg,
                color: selectedType.color,
                fontWeight: 600
              }}
            />
          )}
        </Box>
        <Box
          onClick={onClose}
          sx={{ cursor: 'pointer', color: '#94a3b8', display: 'flex', '&:hover': { color: '#111827' } }}
        >
          <X size={20} />
        </Box>
      </DialogTitle>

      <LinearProgress
        variant='determinate'
        value={((step + 1) / STEPS.length) * 100}
        sx={{
          height: 3,
          bgcolor: '#f1f5f9',
          '& .MuiLinearProgress-bar': { bgcolor: '#2563eb', transition: 'transform 0.4s ease' }
        }}
      />

      <Box sx={{ px: 3, pt: 2, pb: 1 }}>
        <Stepper activeStep={step} alternativeLabel connector={null}>
          {STEPS.map((label, idx) => (
            <Step key={label} completed={idx < step}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontSize: '0.72rem',
                    fontWeight: idx === step ? 700 : 400,
                    color: idx === step ? '#2563eb' : idx < step ? '#10b981' : '#94a3b8'
                  },
                  '& .MuiStepIcon-root': {
                    color: idx < step ? '#10b981' : idx === step ? '#2563eb' : '#e2e8f0',
                    fontSize: '1.1rem'
                  },
                  '& .MuiStepIcon-text': { fontSize: '0.6rem' }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider />

      <DialogContent sx={{ px: 3, py: 2.5, minHeight: 280 }}>
        {step === 0 && (
          <TypeSelector
            selected={lessonType}
            onChange={(t) => {
              setLessonType(t)
              setForm((f) => ({ ...EMPTY_FORM, title: f.title }))
            }}
          />
        )}
        {step === 1 && lessonType && <CoreForm lessonType={lessonType} form={form} onChange={setField} />}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1, justifyContent: 'space-between' }}>
        <Button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0 || isEdit}
          startIcon={<ChevronLeft size={16} />}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            color: '#64748b',
            border: '1.5px solid #e2e8f0',
            px: 2,
            visibility: step === 0 || isEdit ? 'hidden' : 'visible',
            '&:hover': { bgcolor: '#f8fafc' }
          }}
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onClose}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748b',
              border: '1.5px solid #e2e8f0',
              px: 2.5,
              '&:hover': { bgcolor: '#f8fafc' }
            }}
          >
            Cancel
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={loading || !canProceed}
              variant='contained'
              startIcon={loading ? undefined : <Check size={15} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#2563eb',
                px: 2.5,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1d4ed8' },
                '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
              }}
            >
              {loading ? (
                <CircularProgress size={16} sx={{ color: '#fff' }} />
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create & Continue'
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
              variant='contained'
              endIcon={<ChevronRight size={16} />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#2563eb',
                px: 2.5,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1d4ed8' },
                '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
              }}
            >
              Next
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  )
}
