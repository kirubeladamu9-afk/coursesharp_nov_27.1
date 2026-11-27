import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import {
  createLearningSubtopic,
  deleteLearningSubtopic,
  getLearningTopics,
  type LearningSubtopic,
  type SyllabusTopic,
  updateLearningSubtopic,
} from '@/services/api'

const MAX_LABEL_LENGTH = 100

const getMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback

const SyllabusSubtopicsDialog = ({ topic, grade, onClose }: { topic: SyllabusTopic; grade: number; onClose: () => void }) => {
  const [learningTopicId, setLearningTopicId] = useState<number | null>(null)
  const [subtopics, setSubtopics] = useState<LearningSubtopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    getLearningTopics({ syllabusGrade: grade })
      .then((topics) => {
        if (!active) return
        const learningTopic = topics.find((item) => item.syllabusTopicId === topic.id)
        setLearningTopicId(learningTopic?.id ?? null)
        setSubtopics(learningTopic?.subtopics ?? [])
      })
      .catch((reason) => { if (active) setLoadError(getMessage(reason, 'Unable to load subtopics.')) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [grade, topic.id])

  const replaceSubtopic = (updated: LearningSubtopic) => setSubtopics((current) => current.map((item) => item.id === updated.id ? updated : item))

  const runAction = async (action: () => Promise<void>) => {
    setIsSaving(true)
    setActionError(null)
    try {
      await action()
    } catch (reason) {
      setActionError(getMessage(reason, 'Try again.'))
    } finally {
      setIsSaving(false)
    }
  }

  const addSubtopic = () => runAction(async () => {
    if (learningTopicId === null) return
    const created = await createLearningSubtopic(learningTopicId, newTitle.trim())
    setSubtopics((current) => [...current, created])
    setNewTitle('')
  })

  const saveRename = (subtopic: LearningSubtopic) => runAction(async () => {
    replaceSubtopic(await updateLearningSubtopic(subtopic.id, { title: editTitle.trim() }))
    setEditingId(null)
  })

  const toggleArchived = (subtopic: LearningSubtopic) => runAction(async () => {
    replaceSubtopic(await updateLearningSubtopic(subtopic.id, { archived: !subtopic.archived }))
  })

  const removeSubtopic = (subtopic: LearningSubtopic) => runAction(async () => {
    await deleteLearningSubtopic(subtopic.id)
    setSubtopics((current) => current.filter((item) => item.id !== subtopic.id))
    setConfirmDeleteId(null)
  })

  return (
    <Dialog open onClose={() => !isSaving && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>Subtopics for {topic.title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Subtopics appear in the Pause &amp; Check topic picker. Archived subtopics stay on existing questions and reports but are hidden from new tagging. A subtopic can only be deleted when no Pause &amp; Check question uses it.
          </Typography>
          {loadError && <Alert severity="error">{loadError}</Alert>}
          {actionError && <Alert severity="error">{actionError}</Alert>}
          {isLoading && <CircularProgress size={24} aria-label="Loading subtopics" />}

          {!isLoading && !loadError && <>
            {subtopics.length === 0 && <Typography color="text.secondary">No subtopics yet.</Typography>}
            <Stack spacing={1.5}>
              {subtopics.map((subtopic) => editingId === subtopic.id ? (
                <Stack key={subtopic.id} direction="row" spacing={1} alignItems="center">
                  <TextField size="small" fullWidth autoFocus label="Subtopic name" value={editTitle} inputProps={{ maxLength: MAX_LABEL_LENGTH }} onChange={(event) => setEditTitle(event.target.value)} disabled={isSaving} />
                  <Button size="small" onClick={() => void saveRename(subtopic)} disabled={isSaving || !editTitle.trim()}>Save</Button>
                  <Button size="small" onClick={() => setEditingId(null)} disabled={isSaving}>Cancel</Button>
                </Stack>
              ) : (
                <Stack key={subtopic.id} direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ flex: 1, minWidth: 0, fontWeight: 600, color: subtopic.archived ? 'text.secondary' : 'text.primary' }}>{subtopic.title}</Typography>
                  {subtopic.archived && <Chip size="small" variant="outlined" label="Archived" />}
                  {confirmDeleteId === subtopic.id ? (
                    <>
                      <Typography variant="body2" color="error">Delete this subtopic?</Typography>
                      <Button size="small" color="error" variant="contained" onClick={() => void removeSubtopic(subtopic)} disabled={isSaving}>Delete</Button>
                      <Button size="small" onClick={() => setConfirmDeleteId(null)} disabled={isSaving}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="small" aria-label={`Rename ${subtopic.title}`} onClick={() => { setEditingId(subtopic.id); setEditTitle(subtopic.title) }} disabled={isSaving}>Rename</Button>
                      <Button size="small" onClick={() => void toggleArchived(subtopic)} disabled={isSaving}>{subtopic.archived ? 'Restore' : 'Archive'}</Button>
                      <Button size="small" color="error" aria-label={`Delete ${subtopic.title}`} onClick={() => setConfirmDeleteId(subtopic.id)} disabled={isSaving}>Delete</Button>
                    </>
                  )}
                </Stack>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <TextField size="small" fullWidth label="New subtopic" value={newTitle} inputProps={{ maxLength: MAX_LABEL_LENGTH }} onChange={(event) => setNewTitle(event.target.value)} disabled={isSaving || learningTopicId === null} />
              <Button size="small" onClick={() => void addSubtopic()} disabled={isSaving || learningTopicId === null || !newTitle.trim()} sx={{ flexShrink: 0 }}>Add subtopic</Button>
            </Stack>
          </>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Done</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SyllabusSubtopicsDialog
