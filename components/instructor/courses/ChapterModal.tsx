import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  MenuItem
} from '@mui/material'

const EMPTY = { title: '', status: 'draft', sort_order: 1 }

export default function ChapterModal({ open, onClose, onSubmit, editingChapter, loading, error }) {
  const isEdit = !!editingChapter
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (editingChapter) setForm(editingChapter)
    else setForm(EMPTY)
  }, [editingChapter, open])

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>{isEdit ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
          <TextField label='Title *' value={form.title} onChange={(e) => set('title', e.target.value)} fullWidth />
          <TextField
            label='Sort Order'
            type='number'
            value={form.sort_order}
            onChange={(e) => set('sort_order', Number(e.target.value))}
            fullWidth
          />
          <TextField
            select
            label='Status'
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            fullWidth
          >
            <MenuItem value='draft'>Draft</MenuItem>
            <MenuItem value='published'>Published</MenuItem>
            <MenuItem value='archived'>Archived</MenuItem>
          </TextField>
          {error && <Typography color='error'>{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSubmit(form)} disabled={loading || !form.title} variant='contained'>
          {loading ? <CircularProgress size={16} /> : isEdit ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
