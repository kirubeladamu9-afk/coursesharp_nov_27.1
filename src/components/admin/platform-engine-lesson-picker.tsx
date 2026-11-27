import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { type FC, useEffect, useMemo, useState } from 'react'
import { type AdminLesson } from './admin-data'
import { STEM_TOOL_LIBRARY, type StemToolDefinition } from '@/components/stem-lab/stem-tool-library'
import { engineForTopic, getCurriculumTopicKey, getMathTopic } from './stem-curriculum'
import { isStemTopicForGrade, STEM_GRADES, STEM_TOPICS, type StemGradeBand } from '@/components/stem-lab/stem-lab-data'
import { type PlatformEngineId } from '@/components/stem-lab/platform-engine-library'
import { PlatformEnginePreview } from '@/components/stem-lab/platform-engine-previews'

const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology'] as const
type SubjectFilter = typeof subjects[number]
const stages = ['All', 'Foundation', 'Core', 'Advanced', 'Applied lab'] as const
type StageFilter = typeof stages[number]
const grades = ['All', ...STEM_GRADES] as const
type GradeFilter = typeof grades[number]
const formatGrades = (grades: number[]) => `Grades ${grades.join(', ')}`
const comingSoonChemistryTopics = new Set(['Salts', 'Laboratory Techniques & Safety', 'Mole Concept', 'Stoichiometry', 'Oxidation & Reduction', 'Organic Chemistry', 'Chemical Kinetics', 'Chemical Equilibrium', 'Solubility Equilibrium', 'Thermochemistry', 'Electrochemistry', 'Redox Chemistry', 'Hydrocarbons', 'Alcohols & Ethers', 'Aldehydes & Ketones', 'Carboxylic Acids', 'Polymers', 'Biochemistry', 'Environmental Chemistry'])
const comingSoonBiologyTopics = new Set(['Seeds & Germination', 'Animals Around Us', 'Healthy Habits', 'Habitats', 'Life Cycles', 'Human Body Systems', 'Cell Structure', 'Microscopes', 'Plant Reproduction', 'Respiration', 'Circulation', 'Biodiversity', 'Cell Biology', 'Biological Molecules', 'Enzymes', 'Cell Division', 'Genetics', 'Molecular Biology', 'Plant Physiology', 'Animal Physiology', 'Reproduction', 'Microbiology', 'Ecology', 'Ecosystems', 'Evolution', 'Molecular Genetics', 'DNA & RNA', 'Biotechnology', 'Human Reproduction', 'Immunology', 'Population Biology', 'Conservation Biology', 'Food Chains', 'Animal Classification'])

type TopicOption = {
  key: string
  title: string
  description: string
  subject: Exclude<SubjectFilter, 'All'>
  stage: Exclude<StageFilter, 'All'>
  grades: number[]
  difficultyBand: StemGradeBand
  platformEngineId: PlatformEngineId
  comingSoon?: boolean
  simulation?: StemToolDefinition
  activity?: ReturnType<typeof getMathTopic>
}

type PlatformEngineLessonPickerProps = {
  lesson: AdminLesson
  updateLessonDraft: (lesson: AdminLesson) => void
  onSave: (lesson?: AdminLesson) => void
  classGrade?: number | null
  restrictToClassGrade?: boolean
}

const topicOptions = (): TopicOption[] => STEM_TOPICS.map((topic) => {
  const subject: Exclude<SubjectFilter, 'All'> = topic.subject === 'Math' ? 'Mathematics' : topic.subject
  const appliedLabTools = ['Pendulum Lab', 'Projectile Motion Lab', 'Neutralization Lab', 'Osmosis Lab']
  const stage: TopicOption['stage'] = topic.tools.some((tool) => appliedLabTools.includes(tool))
    ? 'Applied lab'
    : topic.difficultyBand === 'Grade 1–2' || topic.difficultyBand === 'Grade 3–5' ? 'Foundation' : topic.difficultyBand === 'Grade 6–8' ? 'Core' : 'Advanced'
  const toolId = topic.title === 'Pendulum Experiment' ? 'pendulum-lab' : topic.title === 'Projectile Motion' ? 'projectile-motion-lab' : topic.title === 'Acids & Bases' ? 'neutralization-lab' : topic.title === 'Osmosis' ? 'osmosis-lab' : undefined
  return {
    key: getCurriculumTopicKey(subject, topic.title) ?? topic.id,
    title: topic.title,
    description: topic.overview,
    subject,
    stage,
    grades: topic.grades,
    difficultyBand: topic.difficultyBand,
    platformEngineId: engineForTopic(subject, topic.title),
    comingSoon: topic.title === 'Osmosis' || (subject === 'Chemistry' && comingSoonChemistryTopics.has(topic.title)) || (subject === 'Biology' && comingSoonBiologyTopics.has(topic.title)),
    simulation: toolId ? STEM_TOOL_LIBRARY.find((tool) => tool.id === toolId) : undefined,
    activity: subject === 'Mathematics' ? getMathTopic(topic.title) : undefined,
  }
})

const ActivitiesPicker: FC<PlatformEngineLessonPickerProps> = ({ lesson, updateLessonDraft, onSave }) => {
  const [subject, setSubject] = useState<SubjectFilter>('All')
  const [stage, setStage] = useState<StageFilter>('All')
  const [grade, setGrade] = useState<GradeFilter>('All')
  const [search, setSearch] = useState('')
  const [legacyTopicDismissed, setLegacyTopicDismissed] = useState(false)
  const options = useMemo(topicOptions, [])
  const selectedKey = legacyTopicDismissed || lesson.simulationLab ? null : options.find((option) => option.title === lesson.title)?.key ?? lesson.curriculumTopic ?? null
  const filteredOptions = options.filter((option) => (subject === 'All' || option.subject === subject) && (stage === 'All' || option.stage === stage) && (grade === 'All' || isStemTopicForGrade(option, grade)) && `${option.title} ${option.subject} ${option.description}`.toLowerCase().includes(search.trim().toLowerCase()))
  const selectedOption = options.find((option) => option.key === selectedKey)
  const selectTopic = (option: TopicOption) => { if (option.comingSoon) return; setLegacyTopicDismissed(false); updateLessonDraft({ ...lesson, simulationLab: undefined, title: lesson.title.startsWith('New ') ? option.title : lesson.title, curriculumTopic: option.key, platformEngineId: option.platformEngineId, simulationToolId: option.simulation?.id ?? option.platformEngineId, simulation: option.simulation?.config }) }
  const saveSelectedTopic = () => {
    if (!selectedOption || selectedOption.comingSoon) return
    const normalizedLesson = { ...lesson, curriculumTopic: selectedOption.key, platformEngineId: selectedOption.platformEngineId, simulationToolId: selectedOption.simulation?.id ?? selectedOption.platformEngineId, simulation: selectedOption.simulation?.config }
    updateLessonDraft(normalizedLesson)
    onSave(normalizedLesson)
  }

  if (selectedOption) return <Stack spacing={2}>
    <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => { setLegacyTopicDismissed(true); updateLessonDraft({ ...lesson, title: lesson.title === selectedOption.title ? 'New simulation lesson' : lesson.title, curriculumTopic: undefined, platformEngineId: undefined, simulationToolId: '', simulation: undefined }) }} sx={{ alignSelf: 'flex-start' }}>Back to topic library</Button>
    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'primary.main', backgroundColor: 'action.selected' }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}><Box><Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>Curriculum topic</Typography><Typography variant="h6">{selectedOption.title}</Typography><Typography variant="body2" color="text.secondary">{selectedOption.description}</Typography></Box><Stack direction="row" spacing={.75} flexWrap="wrap"><Chip label={selectedOption.subject} color="primary" /><Chip label={formatGrades(selectedOption.grades)} variant="outlined" /><Chip label={selectedOption.stage} variant="outlined" /><Chip label={`Difficulty ${selectedOption.difficultyBand.replace('Grade ', '')}`} variant="outlined" />{selectedOption.comingSoon && <Chip label="Coming soon" color="default" />}</Stack></Stack></Paper>
    <PlatformEnginePreview engineId={selectedOption.platformEngineId} mathTopic={selectedOption.activity} topicTitle={selectedOption.title} />
    {selectedOption.simulation && <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Guided activity ready</Typography><Typography variant="body2" color="text.secondary">{selectedOption.simulation.config.overview}</Typography></Paper>}
    <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={saveSelectedTopic} disabled={!lesson.title.trim() || selectedOption.comingSoon}>{selectedOption.comingSoon ? 'Coming soon' : 'Save topic as lesson'}</Button>
  </Stack>

  return <Stack spacing={1.5}>
    <Box><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Choose a curriculum topic</Typography><Typography variant="body2" color="text.secondary">Pick the topic students will learn. The platform automatically attaches the right interactive activity.</Typography></Box>
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25}><TextField fullWidth size="small" label="Search topics" value={search} onChange={(event) => setSearch(event.target.value)} /><FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Grade</InputLabel><Select label="Grade" value={grade} onChange={(event) => setGrade(event.target.value as GradeFilter)}>{grades.map((value) => <MenuItem key={value} value={value}>{value === 'All' ? 'All grades' : `Grade ${value}`}</MenuItem>)}</Select></FormControl><FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Subject</InputLabel><Select label="Subject" value={subject} onChange={(event) => setSubject(event.target.value as SubjectFilter)}>{subjects.map((value) => <MenuItem key={value} value={value}>{value === 'All' ? 'All subjects' : value}</MenuItem>)}</Select></FormControl><FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Stage</InputLabel><Select label="Stage" value={stage} onChange={(event) => setStage(event.target.value as StageFilter)}>{stages.map((value) => <MenuItem key={value} value={value}>{value === 'All' ? 'All stages' : value}</MenuItem>)}</Select></FormControl></Stack>
    <Grid container spacing={1.25}>{filteredOptions.map((option) => <Grid item xs={12} sm={6} key={option.key}><Box component="button" type="button" disabled={option.comingSoon} aria-disabled={option.comingSoon} onClick={() => selectTopic(option)} sx={{ width: '100%', minHeight: 132, p: 1.5, textAlign: 'left', border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper', color: 'text.primary', cursor: option.comingSoon ? 'not-allowed' : 'pointer', opacity: option.comingSoon ? .7 : 1, font: 'inherit', '&:hover': option.comingSoon ? {} : { borderColor: 'primary.main', backgroundColor: 'action.hover', transform: 'translateY(-2px)' }, transition: 'transform .18s ease, border-color .18s ease' }}><Stack spacing={.75}><Stack direction="row" justifyContent="space-between" spacing={1}><Typography sx={{ fontWeight: 700 }}>{option.title}</Typography><Chip size="small" label={option.subject} /></Stack><Typography variant="body2" color="text.secondary">{option.description}</Typography>{option.activity && <Box sx={{ mt: .25, p: 1, borderRadius: 1.5, backgroundColor: 'action.hover' }}><Typography variant="caption" color="primary.main" sx={{ display: 'block', fontWeight: 800 }}>{option.activity.activity}</Typography><Typography variant="caption" color="text.secondary">{option.activity.activityDescription}</Typography></Box>}<Stack direction="row" spacing={.75} alignItems="center"><Chip size="small" label={formatGrades(option.grades)} color="primary" variant="outlined" /><Chip size="small" label={option.stage} variant="outlined" />{option.comingSoon && <Chip size="small" label="Coming soon" />}</Stack></Stack></Box></Grid>)}</Grid>
    {!filteredOptions.length && <Typography color="text.secondary" sx={{ py: 2 }}>No curriculum topics match these filters.</Typography>}
  </Stack>
}

type SimulationLab = {
  id: string
  title: string
  subject: string
  gradeBand: string
  minGrade: number
  maxGrade: number
}

const parseLabs = (data: unknown): SimulationLab[] => {
  if (!Array.isArray(data)) throw new Error('Invalid lab catalog')
  return data.map((item: unknown) => {
    if (!item || typeof item !== 'object') throw new Error('Invalid lab catalog')
    const lab = item as Record<string, unknown>
    if (typeof lab.id !== 'string' || !lab.id || typeof lab.title !== 'string' || typeof lab.subject !== 'string' || typeof lab.gradeBand !== 'string') throw new Error('Invalid lab catalog')
    const match = lab.gradeBand.match(/^Grades?\s+(\d+)(?:\s*[-–—]\s*(\d+))?$/i)
    if (!match) throw new Error('Invalid lab grade band')
    const minGrade = Number(match[1])
    const maxGrade = Number(match[2] ?? match[1])
    if (minGrade > maxGrade) throw new Error('Invalid lab grade band')
    return { id: lab.id, title: lab.title, subject: lab.subject, gradeBand: lab.gradeBand, minGrade, maxGrade }
  })
}

const gradeDistance = (lab: SimulationLab, grade: number) => Math.max(lab.minGrade - grade, 0, grade - lab.maxGrade)

const SimulationLabsPicker: FC<PlatformEngineLessonPickerProps> = ({ lesson, onSave, classGrade, restrictToClassGrade = false }) => {
  const [labs, setLabs] = useState<SimulationLab[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')
  const [retry, setRetry] = useState(0)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('All')
  const [grade, setGrade] = useState('All')
  const hasClassGrade = typeof classGrade === 'number' && Number.isFinite(classGrade)
  const needsGrade = restrictToClassGrade && !hasClassGrade
  const existingLabId = lesson.simulationLab ? lesson.simulationToolId : undefined

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    fetch('/labs.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load labs')
        return response.json() as Promise<unknown>
      })
      .then((data) => { setLabs(parseLabs(data)); setStatus('ready') })
      .catch(() => { if (!controller.signal.aborted) setStatus('error') })
    return () => controller.abort()
  }, [retry])

  const subjects = [...new Set(labs.map((lab) => lab.subject))].sort()
  const labGrades = [...new Set(labs.flatMap((lab) => Array.from({ length: lab.maxGrade - lab.minGrade + 1 }, (_, index) => lab.minGrade + index)))].sort((a, b) => a - b)
  const filteredLabs = labs
    .map((lab, index) => ({ lab, index }))
    .filter(({ lab }) => (!restrictToClassGrade || (hasClassGrade && gradeDistance(lab, classGrade) === 0))
      && (subject === 'All' || lab.subject === subject)
      && (grade === 'All' || gradeDistance(lab, Number(grade)) === 0)
      && `${lab.title} ${lab.subject} ${lab.gradeBand}`.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => (hasClassGrade ? gradeDistance(a.lab, classGrade) - gradeDistance(b.lab, classGrade) : 0) || a.index - b.index)
  const existingLab = labs.find((lab) => lab.id === existingLabId)
  const canSaveExisting = !!existingLabId && !!lesson.title.trim() && (!restrictToClassGrade || (hasClassGrade && status === 'ready' && !!existingLab && gradeDistance(existingLab, classGrade) === 0))

  const selectLab = (lab: SimulationLab) => {
    onSave({ ...lesson, title: lab.title, simulationLab: true, simulationToolId: lab.id, curriculumTopic: undefined, platformEngineId: undefined, simulation: undefined })
  }
  const saveExistingLab = () => {
    if (!canSaveExisting) return
    onSave({ ...lesson, simulationLab: true, curriculumTopic: undefined, platformEngineId: undefined, simulation: undefined })
  }

  return <Stack spacing={1.5}>
    <Box><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Choose a simulation lab</Typography><Typography variant="body2" color="text.secondary">Select a lab to add it to the course draft.</Typography></Box>
    {existingLabId && !needsGrade && <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1}>
      <Typography variant="subtitle2">Current lab: {existingLab?.title ?? existingLabId}</Typography>
      <Typography variant="body2" color="text.secondary">Save the current lesson title, or choose another lab below.</Typography>
      {restrictToClassGrade && status === 'ready' && !canSaveExisting && !!lesson.title.trim() && <Typography variant="body2" color="text.secondary">The current lab is not available for this class grade. Choose another lab.</Typography>}
      <Button variant="outlined" startIcon={<SaveOutlinedIcon />} onClick={saveExistingLab} disabled={!canSaveExisting} sx={{ alignSelf: 'flex-start' }}>Save lesson title</Button>
    </Stack></Paper>}
    {needsGrade ? <Typography color="text.secondary">A class grade is required to show simulation labs for this class.</Typography> : <>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.25}>
        <TextField fullWidth size="small" label="Search labs" value={search} onChange={(event) => setSearch(event.target.value)} />
        <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel id="lab-subject-label">Subject</InputLabel><Select labelId="lab-subject-label" label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)}><MenuItem value="All">All subjects</MenuItem>{subjects.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}><InputLabel id="lab-grade-label">Grade</InputLabel><Select labelId="lab-grade-label" label="Grade" value={grade} onChange={(event) => setGrade(event.target.value)}><MenuItem value="All">All grades</MenuItem>{labGrades.map((value) => <MenuItem key={value} value={String(value)}>Grade {value}</MenuItem>)}</Select></FormControl>
      </Stack>
      {status === 'loading' && <Typography role="status" color="text.secondary">Loading simulation labs...</Typography>}
      {status === 'error' && <Stack spacing={1} alignItems="flex-start"><Typography role="alert" color="error">Could not load simulation labs.</Typography><Button onClick={() => setRetry((value) => value + 1)}>Try again</Button></Stack>}
      {status === 'ready' && (filteredLabs.length ? <Grid container spacing={1.25}>{filteredLabs.map(({ lab }) => <Grid item xs={12} sm={6} key={lab.id}>
        <Box component="button" type="button" onClick={() => selectLab(lab)} sx={{ width: '100%', minHeight: 100, p: 1.5, textAlign: 'left', border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper', color: 'text.primary', cursor: 'pointer', font: 'inherit', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}>
          <Stack spacing={1}><Typography sx={{ fontWeight: 700 }}>{lab.title}</Typography><Stack direction="row" spacing={.75} flexWrap="wrap"><Chip size="small" label={lab.subject} /><Chip size="small" label={lab.gradeBand} variant="outlined" /></Stack></Stack>
        </Box>
      </Grid>)}</Grid> : <Typography color="text.secondary" sx={{ py: 2 }}>No simulation labs match these filters.</Typography>)}
    </>}
  </Stack>
}

const PlatformEngineLessonPicker: FC<PlatformEngineLessonPickerProps> = (props) => {
  const [tab, setTab] = useState<'activities' | 'labs'>(() => props.lesson.simulationLab ? 'labs' : 'activities')
  return <Stack spacing={2}>
    <Tabs value={tab} onChange={(_, value: 'activities' | 'labs') => setTab(value)} aria-label="Lesson activity type">
      <Tab value="activities" label="Activities" />
      <Tab value="labs" label="Simulation labs" />
    </Tabs>
    {tab === 'activities' ? <ActivitiesPicker {...props} /> : <SimulationLabsPicker {...props} />}
  </Stack>
}

export default PlatformEngineLessonPicker
