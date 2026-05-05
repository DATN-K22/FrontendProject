'use client'

import { useState, useCallback } from 'react'
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Collapse,
  Alert,
  Skeleton,
  Tooltip,
  Paper,
  Divider,
  Fade,
  CircularProgress,
  Snackbar,
  Container
} from '@mui/material'
import {
  Add,
  Delete,
  Edit,
  CheckCircle,
  RadioButtonUnchecked,
  ExpandMore,
  ExpandLess,
  DragIndicator,
  Save,
  Close,
  Quiz as QuizIcon,
  HelpOutline,
  CheckBox,
  ShortText,
  Refresh
} from '@mui/icons-material'
import { QuestionType, QuizOption, QuizQuestion } from '@/utils/dto/Quiz'
import { useQuiz } from '@/hooks/useQuiz'
import { useParams, useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ConfirmModal from '@/components/confirm'

// ════════════════════════════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════════════════════════

const TYPE_META: Record<QuestionType, { label: string; color: 'info' | 'success' | 'warning'; icon: React.ReactNode }> =
  {
    SINGLE_CHOICE: { label: 'Single choice', color: 'info', icon: <RadioButtonUnchecked sx={{ fontSize: 14 }} /> },
    MULTI_CHOICE: { label: 'Multi choice', color: 'success', icon: <CheckBox sx={{ fontSize: 14 }} /> },
    FILL_BLANK: { label: 'Fill in blank', color: 'warning', icon: <ShortText sx={{ fontSize: 14 }} /> }
  }

function validateOptions(type: QuestionType, options: Pick<QuizOption, 'is_correct'>[]): string | null {
  if (type === 'FILL_BLANK') return null
  const c = options.filter((o) => o.is_correct).length
  if (type === 'SINGLE_CHOICE' && c !== 1) return 'Single choice requires exactly 1 correct option.'
  if (type === 'MULTI_CHOICE' && c < 1) return 'Multi choice requires at least 1 correct option.'
  return null
}

// ════════════════════════════════════════════════════════════════════════════════
// OptionItem
// ════════════════════════════════════════════════════════════════════════════════

function OptionItem({
  option,
  questionType,
  disabled,
  onToggleCorrect,
  onDelete,
  onUpdateText
}: {
  option: QuizOption
  questionType: QuestionType
  disabled?: boolean
  onToggleCorrect: () => Promise<void>
  onDelete: () => Promise<void>
  onUpdateText: (text: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(option.option_text)
  const [busy, setBusy] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const wrap = async (fn: () => Promise<void>) => {
    setBusy(true)
    await fn()
    setBusy(false)
  }

  const handleSave = () => {
    if (!text.trim() || text.trim() === option.option_text) {
      setEditing(false)
      return
    }
    wrap(() => onUpdateText(text.trim())).then(() => setEditing(false))
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: '10px',
        border: '1px solid',
        borderColor: option.is_correct ? 'success.200' : 'divider',
        bgcolor: option.is_correct ? 'success.50' : 'background.paper',
        opacity: busy || disabled ? 0.65 : 1,
        transition: 'all 0.18s ease',
        '&:hover': { borderColor: option.is_correct ? 'success.400' : 'primary.200' }
      }}
    >
      <Tooltip title={option.is_correct ? 'Unmark as correct' : 'Mark as correct'}>
        <span>
          <IconButton
            size='small'
            disabled={busy || disabled}
            onClick={() => wrap(onToggleCorrect)}
            sx={{ color: option.is_correct ? 'success.main' : 'action.disabled', '&:hover': { color: 'success.main' } }}
          >
            {option.is_correct ? <CheckCircle fontSize='small' /> : <RadioButtonUnchecked fontSize='small' />}
          </IconButton>
        </span>
      </Tooltip>

      {editing ? (
        <TextField
          autoFocus
          size='small'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setEditing(false)
              setText(option.option_text)
            }
          }}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: 13 } }}
        />
      ) : (
        <Typography
          variant='body2'
          sx={{
            flex: 1,
            fontSize: 13,
            fontWeight: option.is_correct ? 500 : 400,
            color: option.is_correct ? 'success.800' : 'text.primary'
          }}
        >
          {option.option_text}
        </Typography>
      )}

      {busy ? (
        <CircularProgress size={14} sx={{ mx: 0.5 }} />
      ) : editing ? (
        <>
          <IconButton size='small' color='primary' onClick={handleSave}>
            <Save fontSize='small' />
          </IconButton>
          <IconButton
            size='small'
            onClick={() => {
              setEditing(false)
              setText(option.option_text)
            }}
          >
            <Close fontSize='small' />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton
            size='small'
            disabled={disabled}
            onClick={() => setEditing(true)}
            sx={{ color: 'action.disabled', '&:hover': { color: 'text.primary' } }}
          >
            <Edit fontSize='small' />
          </IconButton>
          <IconButton
            size='small'
            disabled={disabled}
            onClick={() => setShowDeleteConfirm(true)}
            sx={{ color: 'action.disabled', '&:hover': { color: 'error.main' } }}
          >
            <Delete fontSize='small' />
          </IconButton>
        </>
      )}

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await wrap(onDelete)
          setShowDeleteConfirm(false)
        }}
        title='Delete option?'
        description='This will permanently remove the option from this question.'
        confirmLabel='Delete'
        cancelLabel='Cancel'
        variant='danger'
        loading={busy}
      />
    </Box>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// QuestionCard
// ════════════════════════════════════════════════════════════════════════════════

function QuestionCard({
  question,
  index,
  quiz
}: {
  question: QuizQuestion
  index: number
  quiz: ReturnType<typeof useQuiz>
}) {
  const [expanded, setExpanded] = useState(true)
  const [editingQ, setEditingQ] = useState(false)
  const [qText, setQText] = useState(question.question_text)
  const [newOptText, setNewOptText] = useState('')
  const [cardBusy, setCardBusy] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const validErr = validateOptions(question.questionType, question.quiz_options)
  const meta = TYPE_META[question.questionType]

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveQuestion = async () => {
    const trimmed = qText.trim()
    if (!trimmed || trimmed === question.question_text) {
      setEditingQ(false)
      return
    }
    setCardBusy(true)
    await quiz.updateQuestion(question.id, { question_text: trimmed })
    setCardBusy(false)
    setEditingQ(false)
  }

  const handleTypeChange = async (newType: QuestionType) => {
    setCardBusy(true)
    await quiz.updateQuestion(question.id, { questionType: newType })
    setCardBusy(false)
  }

  const handleDeleteQuestion = async () => {
    setCardBusy(true)
    await quiz.removeQuestion(question.id)
    setCardBusy(false)
  }

  const handleToggleCorrect = async (optId: string) => {
    const opt = question.quiz_options.find((o) => o.id === optId)!
    const newCorrect = !opt.is_correct

    if (!newCorrect && question.questionType === 'MULTI_CHOICE') {
      if (question.quiz_options.filter((o) => o.is_correct).length <= 1) {
        // showToast is internal to hook — hook will surface the error if API fails,
        // but this guard is purely client-side so we use patchQuestion with no change.
        return
      }
    }

    const nextOptions = question.quiz_options.map((o) =>
      question.questionType === 'SINGLE_CHOICE'
        ? { ...o, is_correct: o.id === optId }
        : o.id === optId
          ? { ...o, is_correct: newCorrect }
          : o
    )

    await quiz.updateOption(
      optId,
      { is_correct: question.questionType === 'SINGLE_CHOICE' ? true : newCorrect },
      (prev) => prev.map((q) => (q.id === question.id ? { ...q, quiz_options: nextOptions } : q))
    )
  }

  const handleUpdateOptionText = async (optId: string, text: string) => {
    const nextOptions = question.quiz_options.map((o) => (o.id === optId ? { ...o, option_text: text } : o))
    await quiz.updateOption(optId, { option_text: text }, (prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, quiz_options: nextOptions } : q))
    )
  }

  const handleDeleteOption = async (optId: string) => {
    const opt = question.quiz_options.find((o) => o.id === optId)!
    if (opt.is_correct && question.questionType === 'MULTI_CHOICE') {
      if (question.quiz_options.filter((o) => o.is_correct).length <= 1) {
        return // hook will show error only on API failure; this is a local guard
      }
    }
    await quiz.removeOption(optId, (prev) =>
      prev.map((q) => (q.id === question.id ? { ...q, quiz_options: q.quiz_options.filter((o) => o.id !== optId) } : q))
    )
  }

  const handleAddOption = async () => {
    if (!newOptText.trim()) return
    setCardBusy(true)
    const added = await quiz.addOption(question.id, {
      option_text: newOptText.trim(),
      is_correct: false,
      description: '',
      reason: ''
    })
    setCardBusy(false)
    if (added) setNewOptText('')
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: validErr ? 'error.200' : 'divider',
        borderRadius: '16px',
        overflow: 'hidden',
        opacity: cardBusy ? 0.72 : 1,
        transition: 'opacity 0.2s, box-shadow 0.2s, border-color 0.2s',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          bgcolor: 'background.paper'
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <Box sx={{ color: 'text.disabled', display: 'flex', cursor: 'grab' }}>
          <DragIndicator fontSize='small' />
        </Box>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '16px',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: 'text.secondary',
            flexShrink: 0
          }}
        >
          {index + 1}
        </Box>
        <Typography variant='body2' sx={{ flex: 1, fontWeight: 500, fontSize: 13.5 }} noWrap>
          {question.question_text}
        </Typography>
        <Chip
          size='small'
          label={meta.label}
          color={meta.color}
          icon={meta.icon as any}
          sx={{ fontSize: 11, height: 22, '& .MuiChip-label': { px: 0.75 } }}
        />
        {validErr && <Chip size='small' label='Error' color='error' sx={{ fontSize: 11, height: 22 }} />}
        {cardBusy && <CircularProgress size={14} />}
        <IconButton
          size='small'
          disabled={cardBusy}
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteConfirm(true)
          }}
          sx={{ color: 'action.disabled', '&:hover': { color: 'error.main' } }}
        >
          <Delete fontSize='small' />
        </IconButton>
        <IconButton size='small' sx={{ color: 'action.disabled' }}>
          {expanded ? <ExpandLess fontSize='small' /> : <ExpandMore fontSize='small' />}
        </IconButton>
      </Box>

      {/* Body */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
          {/* Question text + type */}
          <Stack direction='row' spacing={1.5} alignItems='flex-start' mb={2}>
            <Box sx={{ flex: 1 }}>
              {editingQ ? (
                <TextField
                  autoFocus
                  fullWidth
                  multiline
                  size='small'
                  label='Question content'
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                />
              ) : (
                <Typography variant='body2' sx={{ lineHeight: 1.6, fontSize: 13.5 }}>
                  {question.question_text}
                </Typography>
              )}
            </Box>
            <FormControl size='small' sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontSize: 12 }}>Type</InputLabel>
              <Select
                value={question.questionType}
                label='Type'
                disabled={cardBusy}
                onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                sx={{
                  bgcolor: 'background.paper',
                  fontSize: 12,
                  borderRadius: '9px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '9px' // Đảm bảo cái viền (outline) cũng bo theo
                  }
                }}
              >
                {(Object.keys(TYPE_META) as QuestionType[]).map((t) => (
                  <MenuItem key={t} value={t} sx={{ fontSize: 12 }}>
                    {TYPE_META[t].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {editingQ ? (
              <Stack direction='row' spacing={0.5}>
                <IconButton size='small' color='primary' onClick={handleSaveQuestion} disabled={cardBusy}>
                  {cardBusy ? <CircularProgress size={14} /> : <Save fontSize='small' />}
                </IconButton>
                <IconButton
                  size='small'
                  onClick={() => {
                    setEditingQ(false)
                    setQText(question.question_text)
                  }}
                >
                  <Close fontSize='small' />
                </IconButton>
              </Stack>
            ) : (
              <IconButton
                size='small'
                disabled={cardBusy}
                onClick={() => setEditingQ(true)}
                sx={{ color: 'action.disabled', '&:hover': { color: 'primary.main' } }}
              >
                <Edit fontSize='small' />
              </IconButton>
            )}
          </Stack>

          {/* Options */}
          {question.questionType !== 'FILL_BLANK' ? (
            <Stack spacing={0.75}>
              {question.quiz_options.length === 0 ? (
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: '10px',
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    No options yet - add one to get started.
                  </Typography>
                </Box>
              ) : (
                question.quiz_options.map((opt) => (
                  <OptionItem
                    key={opt.id}
                    option={opt}
                    questionType={question.questionType}
                    disabled={cardBusy}
                    onToggleCorrect={() => handleToggleCorrect(opt.id)}
                    onDelete={() => handleDeleteOption(opt.id)}
                    onUpdateText={(text) => handleUpdateOptionText(opt.id, text)}
                  />
                ))
              )}

              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <TextField
                  size='small'
                  fullWidth
                  placeholder='Enter a new option...'
                  value={newOptText}
                  onChange={(e) => setNewOptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddOption()
                  }}
                  disabled={cardBusy}
                  sx={{
                    bgcolor: 'background.paper',
                    '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '10px' }
                  }}
                />
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={cardBusy ? <CircularProgress size={12} /> : <Add />}
                  onClick={handleAddOption}
                  disabled={!newOptText.trim() || cardBusy}
                  sx={{ whiteSpace: 'nowrap', borderRadius: '10px', fontSize: 12 }}
                >
                  Add
                </Button>
              </Box>
              {validErr && (
                <Alert severity='error' sx={{ py: 0.5, fontSize: 12, borderRadius: '16px' }}>
                  {validErr}
                </Alert>
              )}
            </Stack>
          ) : (
            <Box
              sx={{
                p: 1.5,

                borderRadius: '10px',
                border: '1px dashed',
                borderColor: 'warning.300',
                bgcolor: 'warning.50'
              }}
            >
              <Typography variant='caption' color='warning.800'>
                Students will enter their own answer - no options are needed for fill-in-the-blank questions.
              </Typography>
            </Box>
          )}
        </Box>

        <ConfirmModal
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={async () => {
            await handleDeleteQuestion()
            setShowDeleteConfirm(false)
          }}
          title='Delete question?'
          description='This will permanently remove the question and all of its options.'
          confirmLabel='Delete'
          cancelLabel='Cancel'
          variant='danger'
          loading={cardBusy}
        />
      </Collapse>
    </Paper>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// AddQuestionForm
// ════════════════════════════════════════════════════════════════════════════════

function AddQuestionForm({
  quizId,
  quiz,
  onCancel
}: {
  quizId: string
  quiz: ReturnType<typeof useQuiz>
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [type, setType] = useState<QuestionType>('SINGLE_CHOICE')
  const [options, setOptions] = useState([
    { _k: 'a', option_text: '', is_correct: false },
    { _k: 'b', option_text: '', is_correct: false }
  ])
  const [submitting, setSubmitting] = useState(false)

  const filled = options.filter((o) => o.option_text.trim())
  const validErr = validateOptions(
    type,
    filled.map((o) => ({ is_correct: o.is_correct }))
  )
  const canSubmit = !!text.trim() && !validErr && !submitting

  const handleToggle = (k: string) =>
    setOptions((prev) =>
      prev.map((o) =>
        type === 'SINGLE_CHOICE'
          ? { ...o, is_correct: o._k === k }
          : o._k === k
            ? { ...o, is_correct: !o.is_correct }
            : o
      )
    )

  const handleSubmit = async () => {
    setSubmitting(true)
    const added = await quiz.addQuestion({
      question_text: text.trim(),
      questionType: type,
      options:
        type !== 'FILL_BLANK'
          ? filled.map((o) => ({
              option_text: o.option_text.trim(),
              is_correct: o.is_correct,
              description: '',
              reason: ''
            }))
          : undefined
    })
    setSubmitting(false)
    if (added) onCancel()
  }

  return (
    <Paper
      elevation={0}
      sx={{ border: '2px solid', borderColor: 'primary.200', borderRadius: '16px', p: 2.5, bgcolor: 'primary.50' }}
    >
      <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600, color: 'primary.800' }}>
        New question
      </Typography>
      <Stack spacing={2}>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={2}
          size='small'
          label='Question content'
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitting}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: '10px',
            '& .MuiOutlinedInput-root': { borderRadius: '10px' }
          }}
        />

        <FormControl size='small' sx={{ maxWidth: 210 }}>
          <InputLabel>Question type</InputLabel>
          <Select
            value={type}
            label='Question type'
            disabled={submitting}
            onChange={(e) => setType(e.target.value as QuestionType)}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '10px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: '10px' // Đảm bảo cái viền (outline) cũng bo theo
              }
            }}
          >
            {(Object.keys(TYPE_META) as QuestionType[]).map((t) => (
              <MenuItem key={t} value={t}>
                {TYPE_META[t].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {type !== 'FILL_BLANK' && (
          <Stack spacing={0.75}>
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
              Options - click the circle to mark the correct answer
            </Typography>
            {options.map((opt, i) => (
              <Box key={opt._k} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <IconButton
                  size='small'
                  disabled={submitting}
                  onClick={() => handleToggle(opt._k)}
                  sx={{ color: opt.is_correct ? 'success.main' : 'action.disabled' }}
                >
                  {opt.is_correct ? <CheckCircle fontSize='small' /> : <RadioButtonUnchecked fontSize='small' />}
                </IconButton>
                <TextField
                  size='small'
                  fullWidth
                  placeholder={`Option ${i + 1}`}
                  value={opt.option_text}
                  disabled={submitting}
                  onChange={(e) =>
                    setOptions((prev) => prev.map((o) => (o._k === opt._k ? { ...o, option_text: e.target.value } : o)))
                  }
                  sx={{
                    bgcolor: 'background.paper',
                    '& .MuiOutlinedInput-root': { fontSize: 13, borderRadius: '10px' }
                  }}
                />
                <IconButton
                  size='small'
                  disabled={submitting}
                  onClick={() => setOptions((prev) => prev.filter((o) => o._k !== opt._k))}
                  sx={{ color: 'action.disabled', '&:hover': { color: 'error.main' } }}
                >
                  <Close fontSize='small' />
                </IconButton>
              </Box>
            ))}
            <Button
              size='small'
              startIcon={<Add />}
              disabled={submitting}
              onClick={() =>
                setOptions((prev) => [
                  ...prev,
                  { _k: Math.random().toString(36).slice(2), option_text: '', is_correct: false }
                ])
              }
              sx={{ alignSelf: 'flex-start', fontSize: 12, borderRadius: '10px' }}
            >
              Add option
            </Button>
            {validErr && (
              <Alert severity='error' sx={{ py: 0.25, fontSize: 12 }}>
                {validErr}
              </Alert>
            )}
          </Stack>
        )}

        <Stack direction='row' spacing={1}>
          <Button
            variant='contained'
            size='small'
            disabled={!canSubmit}
            onClick={handleSubmit}
            startIcon={submitting ? <CircularProgress size={13} color='inherit' /> : undefined}
            sx={{
              borderRadius: '10px'
            }}
          >
            {submitting ? 'Saving...' : 'Add question'}
          </Button>
          <Button
            variant='outlined'
            size='small'
            onClick={onCancel}
            disabled={submitting}
            sx={{
              borderRadius: '10px'
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════════════════════

export default function QuizConfigurationPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const { courseId, quiz_id } = useParams()
  const quiz = useQuiz(quiz_id as string)
  const { questions, loading, loadError, toast, hideToast, fetchQuestions } = quiz
  const router = useRouter()
  const totalValid = questions.filter((q) => !validateOptions(q.questionType, q.quiz_options)).length
  const hasErrors = questions.some((q) => validateOptions(q.questionType, q.quiz_options) !== null)

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
            Quiz Configuration
          </Typography>
        </Box>

        {/* Stats */}
        {!loading && !loadError && (
          <Stack direction='row' spacing={1.5} mb={3} flexWrap='wrap' useFlexGap>
            {(Object.keys(TYPE_META) as QuestionType[]).map((t) => {
              const count = questions.filter((q) => q.questionType === t).length
              const m = TYPE_META[t]
              return (
                <Chip
                  key={t}
                  icon={m.icon as any}
                  label={`${count} ${m.label}`}
                  color={m.color}
                  variant='outlined'
                  size='small'
                  sx={{ fontSize: 12 }}
                />
              )
            })}
          </Stack>
        )}

        {/* Load error */}
        {loadError && (
          <Alert
            severity='error'
            sx={{ mb: 2, borderRadius: '12px' }}
            action={
              <Button size='small' onClick={fetchQuestions}>
                Retry
              </Button>
            }
          >
            {loadError}
          </Alert>
        )}

        {/* Skeletons */}
        {loading && (
          <Stack spacing={1.5}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant='rounded' height={64} sx={{ borderRadius: '10px' }} />
            ))}
          </Stack>
        )}

        {/* Question list */}
        {!loading && !loadError && (
          <Stack spacing={1.5}>
            {questions.length === 0 && !showAddForm && (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 6,
                  border: '1.5px dashed',
                  borderColor: 'divider',
                  borderRadius: '10px',
                  bgcolor: 'background.paper'
                }}
              >
                <HelpOutline sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
                <Typography variant='body2' color='text.secondary'>
                  No questions yet - click "Add question" to get started.
                </Typography>
              </Box>
            )}

            {questions.map((q, i) => (
              <Fade in key={q.id} timeout={220}>
                <Box>
                  <QuestionCard question={q} index={i} quiz={quiz} />
                </Box>
              </Fade>
            ))}

            {showAddForm ? (
              <AddQuestionForm quizId={quiz_id as string} quiz={quiz} onCancel={() => setShowAddForm(false)} />
            ) : (
              <Button
                variant='outlined'
                startIcon={<Add />}
                fullWidth
                onClick={() => setShowAddForm(true)}
                sx={{
                  borderRadius: '10px',
                  borderStyle: 'dashed',
                  py: 1.5,
                  fontSize: 13,
                  textTransform: 'none',
                  color: 'text.secondary',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main', borderStyle: 'dashed' }
                }}
              >
                Add question
              </Button>
            )}
          </Stack>
        )}

        {/* Toast notification */}
        <Snackbar
          open={!!toast}
          autoHideDuration={2500}
          onClose={hideToast}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={hideToast}
            severity={toast?.severity ?? 'success'}
            variant='filled'
            sx={{ width: '100%', fontSize: 13, borderRadius: '16px' }}
          >
            {toast?.msg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}
