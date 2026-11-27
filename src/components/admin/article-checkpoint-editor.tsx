import AddIcon from '@mui/icons-material/Add'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import { type FC, useEffect, useState } from 'react'
import { type ArticleCheckpoint } from '@/lib/article-checkpoints'
import { createLearningSubtopic, createLearningTopic, getLearningTopics, type LearningTopic, type LearningTopicScope } from '@/services/api'
import { useLearningTopicScope } from './learning-topic-scope'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6
const MAX_LABEL_LENGTH = 100

const toTopicFields = (checkpoint: ArticleCheckpoint): Pick<ArticleCheckpoint, 'topicId' | 'subtopicId' | 'customSubtopic'> => {
  const topicId = checkpoint.topicId ?? null
  if (topicId === null) return { topicId: null, subtopicId: null, customSubtopic: '' }
  const subtopicId = checkpoint.subtopicId ?? null
  return { topicId, subtopicId, customSubtopic: subtopicId === null ? (checkpoint.customSubtopic ?? '').trim() : '' }
}

const ownerScopeOf = (scope: LearningTopicScope | null): { courseId: number } | { classId: number } | null => {
  if (!scope) return null
  if ('courseId' in scope) return { courseId: scope.courseId }
  if ('classId' in scope) return { classId: scope.classId }
  return null
}

const TopicTagFields: FC<{ draft: ArticleCheckpoint; onChange: (patch: Partial<ArticleCheckpoint>) => void }> = ({ draft, onChange }) => {
  const scope = useLearningTopicScope()
  const scopeKey = scope ? JSON.stringify(scope) : ''
  const ownerScope = ownerScopeOf(scope)
  const [topics, setTopics] = useState<LearningTopic[]>([])
  const [loadError, setLoadError] = useState('')
  const [newTopicName, setNewTopicName] = useState('')
  const [newSubtopicName, setNewSubtopicName] = useState('')
  const [tagError, setTagError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!scopeKey) return
    let active = true
    getLearningTopics(JSON.parse(scopeKey) as LearningTopicScope)
      .then((loaded) => { if (active) setTopics(loaded) })
      .catch((reason) => { if (active) setLoadError(reason instanceof Error ? reason.message : 'Unable to load topics.') })
    return () => { active = false }
  }, [scopeKey])

  const selectedTopic = topics.find((topic) => topic.id === draft.topicId)
  const hasListedSubtopic = draft.subtopicId !== null && draft.subtopicId !== undefined

  const runTagAction = async (action: () => Promise<void>) => {
    setIsSaving(true)
    setTagError('')
    try {
      await action()
    } catch (reason) {
      setTagError(reason instanceof Error ? reason.message : 'Unable to save this topic.')
    } finally {
      setIsSaving(false)
    }
  }

  const addTopic = () => runTagAction(async () => {
    if (!ownerScope) return
    const created = await createLearningTopic(ownerScope, newTopicName.trim())
    setTopics((current) => [...current, created])
    onChange({ topicId: created.id, subtopicId: null, customSubtopic: '' })
    setNewTopicName('')
  })

  const addSubtopic = () => runTagAction(async () => {
    if (draft.topicId === null || draft.topicId === undefined) return
    const created = await createLearningSubtopic(draft.topicId, newSubtopicName.trim())
    setTopics((current) => current.map((topic) => topic.id === created.topicId ? { ...topic, subtopics: [...topic.subtopics, created] } : topic))
    onChange({ subtopicId: created.id, customSubtopic: '' })
    setNewSubtopicName('')
  })

  if (!scope) return <Typography variant="body2" color="text.secondary">Save the course or class before tagging questions with topics.</Typography>

  return <Stack spacing={1.5}>
    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Learning topic</Typography>
    {loadError && <Typography variant="body2" color="error">{loadError}</Typography>}
    <TextField select fullWidth size="small" label="Topic" value={draft.topicId ?? ''} onChange={(event) => onChange({ topicId: event.target.value === '' ? null : Number(event.target.value), subtopicId: null, customSubtopic: '' })} helperText="Used for the tutor's learning diagnostics. Leave empty if this question does not map to a topic.">
      <MenuItem value="">No topic</MenuItem>
      {topics.map((topic) => <MenuItem key={topic.id} value={topic.id}>{topic.title}{topic.syllabusTopicId === null ? ' (course topic)' : ''}</MenuItem>)}
    </TextField>
    {draft.topicId !== null && draft.topicId !== undefined && <>
      <TextField select fullWidth size="small" label="Subtopic" value={draft.subtopicId ?? ''} onChange={(event) => onChange({ subtopicId: event.target.value === '' ? null : Number(event.target.value), customSubtopic: '' })}>
        <MenuItem value="">No listed subtopic</MenuItem>
        {(selectedTopic?.subtopics ?? []).filter((subtopic) => !subtopic.archived || subtopic.id === draft.subtopicId).map((subtopic) => <MenuItem key={subtopic.id} value={subtopic.id}>{subtopic.archived ? `${subtopic.title} (archived)` : subtopic.title}</MenuItem>)}
      </TextField>
      <TextField fullWidth size="small" label="Custom subtopic (optional)" value={hasListedSubtopic ? '' : draft.customSubtopic ?? ''} disabled={hasListedSubtopic} onChange={(event) => onChange({ customSubtopic: event.target.value })} inputProps={{ maxLength: MAX_LABEL_LENGTH }} helperText="Only when no listed subtopic fits." />
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField size="small" fullWidth label="New subtopic" value={newSubtopicName} onChange={(event) => setNewSubtopicName(event.target.value)} inputProps={{ maxLength: MAX_LABEL_LENGTH }} disabled={isSaving} />
        <Button size="small" onClick={addSubtopic} disabled={isSaving || newSubtopicName.trim() === ''} sx={{ flexShrink: 0 }}>Add subtopic</Button>
      </Stack>
    </>}
    {ownerScope && <Stack direction="row" spacing={1} alignItems="center">
      <TextField size="small" fullWidth label="New course or class topic" value={newTopicName} onChange={(event) => setNewTopicName(event.target.value)} inputProps={{ maxLength: MAX_LABEL_LENGTH }} disabled={isSaving} />
      <Button size="small" onClick={addTopic} disabled={isSaving || newTopicName.trim() === ''} sx={{ flexShrink: 0 }}>Add topic</Button>
    </Stack>}
    {tagError && <Typography variant="body2" color="error">{tagError}</Typography>}
  </Stack>
}

export const ArticleCheckpointDialog: FC<{ checkpoint: ArticleCheckpoint; onSave: (checkpoint: ArticleCheckpoint) => void; onCancel: () => void }> = ({ checkpoint, onSave, onCancel }) => {
  const [draft, setDraft] = useState(() => ({ ...checkpoint, ...toTopicFields(checkpoint) }))
  const options = draft.options.map((option) => option.trim())
  const canSave = draft.question.trim() !== '' && options.length >= MIN_OPTIONS && options.every(Boolean) && draft.correctOption < options.length

  const updateOption = (index: number, value: string) => setDraft((current) => ({ ...current, options: current.options.map((option, optionIndex) => optionIndex === index ? value : option) }))
  const removeOption = (index: number) => setDraft((current) => ({
    ...current,
    options: current.options.filter((_, optionIndex) => optionIndex !== index),
    correctOption: current.correctOption === index ? 0 : current.correctOption > index ? current.correctOption - 1 : current.correctOption,
  }))

  return <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
    <DialogTitle>Pause &amp; Check question</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={2}>
        <TextField required fullWidth multiline minRows={2} label="Question" value={draft.question} onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))} inputProps={{ maxLength: 500 }} />
        <RadioGroup aria-label="Answer options" value={draft.correctOption} onChange={(event) => setDraft((current) => ({ ...current, correctOption: Number(event.target.value) }))}>
          <Stack spacing={1}>
            {draft.options.map((option, index) => <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Radio value={index} size="small" inputProps={{ 'aria-label': `Mark option ${index + 1} as correct` }} />
              <TextField required fullWidth size="small" label={`Option ${index + 1}`} value={option} onChange={(event) => updateOption(index, event.target.value)} inputProps={{ maxLength: 300 }} />
              <IconButton aria-label={`Remove option ${index + 1}`} disabled={draft.options.length <= MIN_OPTIONS} onClick={() => removeOption(index)}><DeleteOutlineIcon fontSize="small" /></IconButton>
            </Stack>)}
          </Stack>
        </RadioGroup>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">Select the radio button beside the correct answer.</Typography>
          <Button size="small" startIcon={<AddIcon />} disabled={draft.options.length >= MAX_OPTIONS} onClick={() => setDraft((current) => ({ ...current, options: [...current.options, ''] }))}>Add option</Button>
        </Stack>
        <TextField fullWidth multiline minRows={2} label="Explanation (optional)" helperText="Shown to students after they check their answer." value={draft.explanation} onChange={(event) => setDraft((current) => ({ ...current, explanation: event.target.value }))} inputProps={{ maxLength: 1000 }} />
        <TopicTagFields draft={draft} onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))} />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button color="inherit" onClick={onCancel}>Cancel</Button>
      <Button variant="contained" disabled={!canSave} onClick={() => onSave({ ...draft, ...toTopicFields(draft), question: draft.question.trim(), options, explanation: draft.explanation.trim() })}>Save question</Button>
    </DialogActions>
  </Dialog>
}

export const ArticleCheckpointList: FC<{ checkpoints: ArticleCheckpoint[]; onEdit: (id: number) => void; onMove: (id: number, direction: -1 | 1) => void; onDelete: (id: number) => void }> = ({ checkpoints, onEdit, onMove, onDelete }) => <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Pause &amp; Check questions</Typography>
  <Typography variant="caption" color="text.secondary">Click where a question should appear in the article, then select Add Pause &amp; Check. Students see each question at that position.</Typography>
  {checkpoints.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>No questions yet.</Typography>}
  <Stack spacing={1} sx={{ mt: 1.5 }}>
    {checkpoints.map((checkpoint, index) => <Stack key={checkpoint.id} direction="row" alignItems="center" spacing={1} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1.5, minWidth: 0 }}>
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{index + 1}. {checkpoint.question || 'Untitled question'}</Typography>
      <IconButton size="small" aria-label={`Move question ${index + 1} up`} disabled={index === 0} onClick={() => onMove(checkpoint.id, -1)}><ArrowUpwardIcon fontSize="small" /></IconButton>
      <IconButton size="small" aria-label={`Move question ${index + 1} down`} disabled={index === checkpoints.length - 1} onClick={() => onMove(checkpoint.id, 1)}><ArrowDownwardIcon fontSize="small" /></IconButton>
      <IconButton size="small" aria-label={`Edit question ${index + 1}`} onClick={() => onEdit(checkpoint.id)}><EditOutlinedIcon fontSize="small" /></IconButton>
      <IconButton size="small" color="error" aria-label={`Delete question ${index + 1}`} onClick={() => onDelete(checkpoint.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
    </Stack>)}
  </Stack>
</Paper>

export const ArticleHelpSettings: FC<{ sectionTitles: string[]; disabledSections: number[]; onChange: (disabledSections: number[]) => void }> = ({ sectionTitles, disabledSections, onChange }) => <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>I Need Help sections</Typography>
  <Typography variant="caption" color="text.secondary">Students can flag each Heading 2 section. Turn off sections that should not accept requests.</Typography>
  {sectionTitles.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>Add a Heading 2 to create sections students can flag.</Typography>}
  <Stack spacing={0.5} sx={{ mt: 1 }}>
    {sectionTitles.map((title, index) => <FormControlLabel key={index} control={<Switch size="small" checked={!disabledSections.includes(index)} onChange={(event) => onChange(event.target.checked ? disabledSections.filter((item) => item !== index) : [...disabledSections, index])} />} label={<Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{title}</Typography>} sx={{ mx: 0, alignItems: 'center' }} />)}
  </Stack>
</Paper>
