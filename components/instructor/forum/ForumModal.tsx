import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useState, useEffect } from 'react'

const EMPTY = { short_description: '', long_description: '', thumbnail_url: '', course_id: '' }

export default function ForumModal({ open, onClose, onSubmit, editingForum, loading, error, courses = [] }: any) {
  const isEdit = !!editingForum
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (editingForum) {
      setForm({
        short_description: editingForum.short_description || '',
        long_description: editingForum.long_description || '',
        thumbnail_url: editingForum.thumbnail_url || '',
        course_id: editingForum.course_id || ''
      })
    } else {
      setForm(EMPTY)
    }
  }, [editingForum, open])

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }))

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{isEdit ? 'Edit Forum' : 'Add Forum'}</DialogTitle>
      <DialogContent>
        {(!isEdit && courses.length > 0) && (
          <FormControl fullWidth margin='normal'>
            <InputLabel id="course-select-label">Choose Course</InputLabel>
            <Select
              labelId="course-select-label"
              value={form.course_id || ''}
              label='Choose Course'
              onChange={(e) => set('course_id', e.target.value)}
            >
              {courses.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          label='Short Description'
          value={form.short_description}
          onChange={(e) => set('short_description', e.target.value)}
          fullWidth
          margin='normal'
        />
        <TextField
          label='Long Description'
          value={form.long_description}
          onChange={(e) => set('long_description', e.target.value)}
          fullWidth
          margin='normal'
          multiline
          rows={3}
        />
        <TextField
          label='Thumbnail URL'
          value={form.thumbnail_url}
          onChange={(e) => set('thumbnail_url', e.target.value)}
          fullWidth
          margin='normal'
        />
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={() => {
            if (isEdit) {
              const { course_id, ...updateData } = form
              onSubmit(updateData)
            } else {
              onSubmit(form)
            }
          }} 
          disabled={loading || !form.short_description || (!isEdit && !form.course_id)} 
          variant='contained'
        >
          {loading ? <CircularProgress size={16} /> : isEdit ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
