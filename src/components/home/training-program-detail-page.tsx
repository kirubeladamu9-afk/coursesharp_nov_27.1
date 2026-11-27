import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { StyledButton } from '@/components/styled-button'
import { type PublicClass } from '@/services/api'
import { AvailabilityBadge, formatSchedule, type ProgramDefinition } from './training-programs'

interface TrainingProgramDetailPageProps {
  program: ProgramDefinition | undefined
  classes: PublicClass[]
  onBack: () => void
  onEnrollClass: (classRecord: PublicClass) => void
  onEnrollProgram: () => void
}

const TrainingProgramDetailPage: React.FC<TrainingProgramDetailPageProps> = ({ program, classes, onBack, onEnrollClass, onEnrollProgram }) => {
  if (!program) return <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center' }}><Typography variant="h4" sx={{ mb: 2 }}>Program not found</Typography><Button onClick={onBack}>Back to programs</Button></Container>

  const learners = classes.reduce((total, classRecord) => total + classRecord.enrolledCount, 0)
  const browseClasses = () => document.getElementById('program-classes')?.scrollIntoView({ behavior: 'smooth' })
  const enrollLabel = program.id === 'international-online-interactive' ? 'Enroll Now' : 'View Available Classes'

  return <Box component="main" sx={{ bgcolor: '#f5f6fa', color: '#10131c' }}>
    <Container maxWidth={false} sx={{ maxWidth: '1040px', pt: { xs: 4, md: 7 }, pb: { xs: 7, md: 11 } }}>
      <Button onClick={onBack} startIcon={<ArrowBackIcon sx={{ fontSize: 15 }} />} sx={{ mb: { xs: 3, md: 5 }, px: 0, color: '#69707d', textTransform: 'none', fontSize: 13 }}>Back to programs</Button>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 350px' }, gap: { xs: 4, md: 6 }, alignItems: 'start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ display: 'inline-block', px: 1.25, py: 0.5, mb: 2, borderRadius: 3, bgcolor: '#fff', color: '#737887', fontSize: 11, fontWeight: 600 }}><Box component="span" sx={{ color: 'primary.main', mr: 0.6 }}>◈</Box>{program.eyebrow}</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 32, md: 44 }, lineHeight: 1.15, letterSpacing: '-0.04em', fontWeight: 700, mb: 2 }}>{program.title}</Typography>
          <Typography sx={{ color: '#69707d', fontSize: 15, lineHeight: 1.65, mb: 3 }}>{program.description}</Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}><SchoolOutlinedIcon sx={{ color: 'primary.main', fontSize: 19 }} /><Typography sx={{ color: '#555d6a', fontSize: 13 }}>Expert-led learning</Typography><Box sx={{ flexGrow: 1 }} /><Typography sx={{ color: '#737887', fontSize: 13 }}>{classes.length} available {classes.length === 1 ? 'class' : 'classes'}</Typography></Stack>
          <Box component="img" src={classes[0]?.cover ?? program.image} alt={program.title} sx={{ display: 'block', width: '100%', aspectRatio: '1.72', objectFit: 'cover', borderRadius: '16px', bgcolor: '#e6e7ee' }} />
          <Stack spacing={5} sx={{ mt: 5 }}>
            <Box><Typography component="h2" sx={{ fontSize: 23, fontWeight: 700, mb: 2, letterSpacing: '-0.02em' }}>Overview</Typography><Typography sx={{ color: '#69707d', fontSize: 14, lineHeight: 1.75 }}>{program.description}</Typography></Box>
            <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: { xs: 2, sm: 3 } }}><Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, mb: 2 }}>Program Highlights</Typography><Stack spacing={1.5}>{program.features.map((feature) => <Stack key={feature} direction="row" spacing={1.25} alignItems="flex-start"><CheckCircleOutlineIcon sx={{ color: 'primary.main', fontSize: 18, mt: '2px' }} /><Typography sx={{ color: '#525866', fontSize: 14, lineHeight: 1.6 }}>{feature}</Typography></Stack>)}</Stack></Box>
            <Box id="program-classes" sx={{ scrollMarginTop: 24 }}><Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, mb: 2 }}>Available Classes</Typography>{classes.length ? <Stack spacing={1.5}>{classes.map((classRecord) => {
              const canEnroll = !classRecord.enrollmentClosed && (classRecord.status === 'open' || classRecord.status === 'full')
              return <Box key={classRecord.id} sx={{ bgcolor: '#fff', borderRadius: '14px', p: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}><Typography sx={{ fontSize: 15, fontWeight: 700, mb: 0.75 }}>{classRecord.title}</Typography><Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} sx={{ color: '#69707d', mb: 1 }}><Stack direction="row" spacing={0.5} alignItems="center"><AccessTimeOutlinedIcon sx={{ fontSize: 15 }} /><Typography sx={{ fontSize: 12 }}>{formatSchedule(classRecord.schedule)}</Typography></Stack><Typography sx={{ fontSize: 12 }}>Tutor: {classRecord.tutorName}</Typography></Stack><AvailabilityBadge classRecord={classRecord} /></Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}><Typography sx={{ fontSize: 18, fontWeight: 700, color: 'primary.main' }}>${classRecord.price}<Typography component="span" sx={{ color: '#858b96', fontSize: 12, fontWeight: 400 }}> / class</Typography></Typography><Button variant="contained" disabled={!canEnroll} onClick={() => onEnrollClass(classRecord)} sx={{ borderRadius: '999px', px: 2.5, textTransform: 'none', boxShadow: 'none' }}>{classRecord.status === 'full' ? 'Join Waitlist' : 'Join'}</Button></Stack>
              </Box>
            })}</Stack> : <Box sx={{ bgcolor: '#fff', borderRadius: '14px', p: 2.5 }}><Typography color="text.secondary" sx={{ fontSize: 14 }}>No published classes are available right now. Please check back soon.</Typography></Box>}</Box>
            <Box><Typography component="h2" sx={{ fontSize: 22, fontWeight: 700, mb: 2 }}>About The Instructors</Typography><Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 2.5 }}><Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.dark', display: 'grid', placeItems: 'center' }}><SchoolOutlinedIcon /></Box><Box><Typography sx={{ fontSize: 15, fontWeight: 700 }}>{classes.length ? [...new Set(classes.map((classRecord) => classRecord.tutorName))].join(', ') : 'Expert tutors'}</Typography><Typography sx={{ color: '#69707d', fontSize: 12, mt: 0.5 }}>{learners.toLocaleString()} learners · {program.title}</Typography></Box></Stack></Box></Box>
          </Stack>
        </Box>
        <Box sx={{ bgcolor: '#fff', borderRadius: '20px', p: 3, boxShadow: '0 24px 55px rgba(32, 37, 59, 0.07)', position: { md: 'sticky' }, top: { md: 24 } }}>
          <Typography sx={{ color: '#858b96', fontSize: 12, mb: 0.5 }}>Program Pricing</Typography>
          <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mb: 3 }}><Typography sx={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>{program.price}</Typography><Typography sx={{ color: '#858b96', fontSize: 13 }}>{program.priceDetail}</Typography></Stack>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>This program includes:</Typography>
          <Stack spacing={1.5} sx={{ color: '#737b88', '& svg': { fontSize: 17 } }}>
            <Stack direction="row" spacing={1} alignItems="center"><GroupsOutlinedIcon /><Typography sx={{ fontSize: 13 }}>{classes.length} available {classes.length === 1 ? 'class' : 'classes'}</Typography></Stack>
            <Stack direction="row" spacing={1} alignItems="center"><AccessTimeOutlinedIcon /><Typography sx={{ fontSize: 13 }}>{classes.length ? formatSchedule(classes[0].schedule) : 'Flexible scheduling'}</Typography></Stack>
            <Stack direction="row" spacing={1} alignItems="center"><SchoolOutlinedIcon /><Typography sx={{ fontSize: 13 }}>Expert tutor support</Typography></Stack>
            {program.features.slice(0, 3).map((feature) => <Stack key={feature} direction="row" spacing={1} alignItems="center"><CheckCircleOutlineIcon /><Typography sx={{ fontSize: 13 }}>{feature}</Typography></Stack>)}
          </Stack>
          <Box sx={{ mt: 3, width: '100%', '& > button': { width: '100%', justifyContent: 'space-between' } }}><StyledButton animated size="large" onClick={program.id === 'international-online-interactive' ? onEnrollProgram : browseClasses}>{enrollLabel}</StyledButton></Box>
        </Box>
      </Box>
    </Container>
  </Box>
}

export default TrainingProgramDetailPage
