import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { type FC, useEffect, useState } from 'react'
import { EVIDENCE_LABELS, type EvidenceLevel } from '@/components/course/study-mastery'
import { getTutorClassLearningDiagnostics, getTutorCourseLearningDiagnostics, type LearningOutcomeTotals, type TutorLearningDiagnostics } from '@/services/api'

type Target = { type: 'course' | 'class'; id: number }
type Topic = TutorLearningDiagnostics['topics'][number]
type Subtopic = Topic['subtopics'][number]

const LEVEL_ORDER: EvidenceLevel[] = ['strong', 'needs_practice', 'not_proven']
const levelColor: Record<EvidenceLevel, 'success' | 'warning' | 'default'> = { strong: 'success', needs_practice: 'warning', not_proven: 'default' }

const LevelChip: FC<{ level: EvidenceLevel }> = ({ level }) => <Chip size="small" color={levelColor[level]} variant={level === 'not_proven' ? 'outlined' : 'filled'} label={EVIDENCE_LABELS[level]} />

const accuracyText = ({ correct, answered }: { correct: number; answered: number }) => answered ? `${Math.round((correct * 100) / answered)}%` : '—'

const OutcomeCells: FC<{ totals: LearningOutcomeTotals }> = ({ totals }) => <>
  <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>{totals.correct}</TableCell>
  <TableCell sx={{ color: totals.incorrect ? 'error.main' : 'text.primary', fontWeight: totals.incorrect ? 600 : 400 }}>{totals.incorrect}</TableCell>
  <TableCell>{totals.skipped}</TableCell>
</>

const headingCell = (label: string) => <TableCell key={label} sx={{ fontWeight: 700, color: 'text.secondary', whiteSpace: 'nowrap' }}>{label}</TableCell>

const TopicLevelsTable: FC<{ topics: Topic[] }> = ({ topics }) => (
  <Box sx={{ overflowX: 'auto' }}>
    <Table size="small" sx={{ minWidth: 640 }}>
      <TableHead>
        <TableRow>
          {['Topic', ...LEVEL_ORDER.map((level) => EVIDENCE_LABELS[level]), 'Correct', 'Incorrect', 'Skipped'].map(headingCell)}
        </TableRow>
      </TableHead>
      <TableBody>
        {topics.flatMap((topic) => [
          <TableRow key={topic.id}>
            <TableCell sx={{ fontWeight: 600 }}>
              {topic.title}
              {topic.misunderstood && <Chip size="small" color="warning" variant="outlined" label="Common difficulty" sx={{ ml: 1 }} />}
            </TableCell>
            {LEVEL_ORDER.map((level) => <TableCell key={level}>{topic.levels[level]}</TableCell>)}
            <OutcomeCells totals={topic.totals} />
          </TableRow>,
          ...topic.subtopics.map((subtopic: Subtopic) => <TableRow key={`${topic.id}-${subtopic.key}`}>
            <TableCell sx={{ pl: 4, color: 'text.secondary' }}>{subtopic.title}</TableCell>
            {LEVEL_ORDER.map((level) => <TableCell key={level}>{subtopic.levels[level]}</TableCell>)}
            <OutcomeCells totals={subtopic.totals} />
          </TableRow>),
        ])}
      </TableBody>
    </Table>
  </Box>
)

const StudentEvidence: FC<{ report: TutorLearningDiagnostics }> = ({ report }) => {
  const students = report.students
    .filter((student) => student.topics.length > 0)
    .sort((first, second) => Number(second.needsSupport) - Number(first.needsSupport) || first.studentName.localeCompare(second.studentName))

  if (students.length === 0) return <Typography variant="body2" color="text.secondary">No students have answered Pause &amp; Check questions tagged to a topic yet.</Typography>

  return <Stack spacing={1.5}>
    {students.map((student) => <Paper key={student.enrollmentId} elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700 }}>{student.studentName || student.studentEmail}</Typography>
          {student.studentName && <Typography variant="body2" color="text.secondary">{student.studentEmail}</Typography>}
        </Box>
        {student.needsSupport && <Chip size="small" color="warning" label="Needs practice" />}
      </Stack>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>{['Topic', 'Level', 'Answered', 'Accuracy', 'Correct', 'Incorrect', 'Skipped'].map(headingCell)}</TableRow>
          </TableHead>
          <TableBody>
            {student.topics.flatMap((topic) => [
              <TableRow key={topic.topicId}>
                <TableCell sx={{ fontWeight: 600 }}>{topic.title}</TableCell>
                <TableCell><LevelChip level={topic.level} /></TableCell>
                <TableCell>{topic.answered}</TableCell>
                <TableCell>{accuracyText(topic)}</TableCell>
                <OutcomeCells totals={topic} />
              </TableRow>,
              ...topic.subtopics.map((subtopic) => <TableRow key={`${topic.topicId}-${subtopic.key}`}>
                <TableCell sx={{ pl: 4, color: 'text.secondary' }}>{subtopic.title}</TableCell>
                <TableCell><LevelChip level={subtopic.level} /></TableCell>
                <TableCell>{subtopic.answered}</TableCell>
                <TableCell>{accuracyText(subtopic)}</TableCell>
                <OutcomeCells totals={subtopic} />
              </TableRow>),
            ])}
          </TableBody>
        </Table>
      </Box>
    </Paper>)}
  </Stack>
}

const LearningDiagnosticsPanel: FC<{ target: Target }> = ({ target }) => {
  const [report, setReport] = useState<TutorLearningDiagnostics | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setReport(null)
    setLoadError(null)
    const request = target.type === 'course' ? getTutorCourseLearningDiagnostics(target.id) : getTutorClassLearningDiagnostics(target.id)
    request
      .then((next) => { if (active) setReport(next) })
      .catch((reason) => { if (active) setLoadError(reason instanceof Error ? reason.message : 'Unable to load learning diagnostics.') })
    return () => { active = false }
  }, [target.type, target.id])

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, mb: 3, border: 1, borderColor: 'divider' }}>
      <Typography variant="h6">Learning diagnostics</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pause &amp; Check answers grouped by topic. Quiz mastery is calculated separately and is not changed by these results.
      </Typography>

      {!report && !loadError && <Stack direction="row" spacing={1} alignItems="center"><CircularProgress size={20} aria-label="Loading learning diagnostics" /><Typography color="text.secondary">Loading learning diagnostics...</Typography></Stack>}
      {loadError && <Alert severity="error">{loadError}</Alert>}
      {report && report.checkpointCount === 0 && <Typography color="text.secondary">No Pause &amp; Check questions are tagged to a topic yet.</Typography>}

      {report && report.checkpointCount > 0 && <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Needs Practice: at least 3 answered with 2 or more incorrect, checked first. Strong: at least 3 answered with 80% or more correct. Fewer than 3 answered is Not Yet Proven. Skipped answers are counted separately and never as incorrect.
        </Typography>
        <Box>
          <Chip size="small" color={report.studentsNeedingSupport > 0 ? 'warning' : 'success'} variant={report.studentsNeedingSupport > 0 ? 'filled' : 'outlined'} label={`${report.studentsNeedingSupport} ${report.studentsNeedingSupport === 1 ? 'student needs' : 'students need'} practice`} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>By topic</Typography>
          <TopicLevelsTable topics={report.topics} />
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>By student</Typography>
          <StudentEvidence report={report} />
        </Box>
      </Stack>}
    </Paper>
  )
}

export default LearningDiagnosticsPanel
