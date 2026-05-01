import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material'
import { useState, useEffect } from 'react'

const lessonTypes = [
  { value: 'video', label: 'Video' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'lab', label: 'Lab' }
]

export default function LessonModal({ open, onClose, onSubmit, editingLesson, loading, error }) {
  const [form, setForm] = useState({
    title: '',
    status: 'published',
    type: 'video',
    sort_order: 1,
    duration: 0,
    short_description: '',
    long_description: '',
    thumbnail_url: ''
  })

  useEffect(() => {
    if (editingLesson) setForm(editingLesson)
    else setForm({
      title: '',
      status: 'published',
      type: 'video',
      sort_order: 1,
      duration: 0,
      short_description: '',
      long_description: '',
      thumbnail_url: ''
    })
  }, [editingLesson, open])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    onSubmit(form)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
      <DialogContent>
        <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Sort Order" name="sort_order" value={form.sort_order} onChange={handleChange} type="number" fullWidth margin="normal" />
        <TextField label="Status" name="status" value={form.status} onChange={handleChange} select fullWidth margin="normal">
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
        </TextField>
        <TextField label="Type" name="type" value={form.type} onChange={handleChange} select fullWidth margin="normal">
          {lessonTypes.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
        </TextField>
        <TextField label="Duration (minutes)" name="duration" value={form.duration} onChange={handleChange} type="number" fullWidth margin="normal" />
        <TextField label="Short Description" name="short_description" value={form.short_description} onChange={handleChange} fullWidth margin="normal" />
        <TextField label="Long Description" name="long_description" value={form.long_description} onChange={handleChange} fullWidth margin="normal" multiline rows={3} />
        <TextField label="Thumbnail URL" name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} fullWidth margin="normal" />
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} variant="contained">{editingLesson ? 'Update' : 'Create'}</Button>
      </DialogActions>
    </Dialog>
  )
}